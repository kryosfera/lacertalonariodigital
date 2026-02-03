import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Product {
  id: string;
  name: string;
  reference: string | null;
  ean: string | null;
}

interface ExtractedProduct {
  productId: string | null;
  productName: string;
  matchedProduct: Product | null;
  quantity: number;
  confidence: 'high' | 'medium' | 'low';
  suggestions?: Product[];
}

interface ProcessedRecipe {
  products: ExtractedProduct[];
  instructions: string;
  rawText: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();
    
    if (!transcript || typeof transcript !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Se requiere el texto transcrito' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch available products from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, reference, ean')
      .eq('is_active', true)
      .eq('is_visible', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw new Error('Error al obtener productos del catálogo');
    }

    // Create product catalog string for the AI prompt
    const productCatalog = (products || []).map(p => 
      `- "${p.name}" (ref: ${p.reference || 'N/A'}, id: ${p.id})`
    ).join('\n');

    // Call Lovable AI to process the transcript
    const systemPrompt = `Eres un asistente experto en procesar recetas médicas/dentales dictadas por voz.
Tu tarea es extraer los productos mencionados y las instrucciones de uso del texto dictado.

CATÁLOGO DE PRODUCTOS DISPONIBLES:
${productCatalog}

REGLAS:
1. Identifica cada producto mencionado y busca la coincidencia más cercana en el catálogo
2. Extrae la cantidad de cada producto (por defecto 1 si no se especifica)
3. Separa las instrucciones de uso del listado de productos
4. Si un producto mencionado no coincide exactamente, sugiere alternativas similares del catálogo
5. Responde SIEMPRE en formato JSON válido

FORMATO DE RESPUESTA (JSON):
{
  "products": [
    {
      "productId": "uuid-del-producto-si-hay-coincidencia-o-null",
      "productName": "nombre mencionado por el usuario",
      "matchedProductName": "nombre del producto coincidente del catálogo o null",
      "quantity": 1,
      "confidence": "high|medium|low",
      "suggestionIds": ["uuid1", "uuid2"] // solo si confidence es low o no hay match
    }
  ],
  "instructions": "texto con las instrucciones de uso extraídas",
  "notes": "cualquier información adicional que no encaje en productos o instrucciones"
}`;

    const userPrompt = `Procesa este texto dictado por un dentista y extrae los productos e instrucciones:

"${transcript}"

Recuerda responder SOLO con JSON válido.`;

    console.log('Calling Lovable AI with transcript:', transcript.substring(0, 100) + '...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de solicitudes excedido. Intenta de nuevo en unos segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA agotados. Contacta al administrador.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Error al procesar con IA');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('Respuesta de IA vacía');
    }

    console.log('AI response:', aiContent.substring(0, 200) + '...');

    // Parse AI response - handle markdown code blocks
    let cleanedContent = aiContent.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, cleanedContent);
      throw new Error('Error al interpretar la respuesta de IA');
    }

    // Enrich products with full product data
    const enrichedProducts = (parsedResult.products || []).map((p: any) => {
      const matchedProduct = p.productId 
        ? products?.find(prod => prod.id === p.productId) 
        : null;
      
      const suggestions = (p.suggestionIds || [])
        .map((id: string) => products?.find(prod => prod.id === id))
        .filter(Boolean);

      return {
        productId: p.productId || null,
        productName: p.productName,
        matchedProduct: matchedProduct || null,
        quantity: p.quantity || 1,
        confidence: p.confidence || 'medium',
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };
    });

    const result: ProcessedRecipe = {
      products: enrichedProducts,
      instructions: parsedResult.instructions || '',
      rawText: transcript,
    };

    console.log('Processed recipe:', JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing voice recipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
