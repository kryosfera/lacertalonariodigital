import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting image sync...');

    // 1. List all files in the product-images bucket
    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 1000 });

    if (listError) {
      console.error('Error listing files:', listError);
      throw listError;
    }

    console.log(`Found ${files?.length || 0} files in bucket`);

    // 2. Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, reference, ean');

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    console.log(`Found ${products?.length || 0} products`);

    // 3. Create a map for quick lookup
    const productMap = new Map<string, { id: string; name: string }>();
    
    products?.forEach((product) => {
      // Map by reference (without dot)
      if (product.reference) {
        const cleanRef = product.reference.replace(/\./g, '');
        productMap.set(cleanRef, { id: product.id, name: product.name });
      }
      
      // Map by last 7 digits of EAN
      if (product.ean && product.ean.length >= 7) {
        const eanSuffix = product.ean.slice(-7);
        // Only set if not already mapped by reference
        if (!productMap.has(eanSuffix)) {
          productMap.set(eanSuffix, { id: product.id, name: product.name });
        }
      }
    });

    console.log(`Product map has ${productMap.size} entries`);

    // 4. Match files to products and update
    const results = {
      matched: [] as { fileName: string; productName: string; cn: string }[],
      unmatched: [] as string[],
      errors: [] as string[],
    };

    for (const file of files || []) {
      // Skip folders
      if (!file.name || file.metadata?.mimetype === 'application/octet-stream') {
        continue;
      }

      // Extract CN from filename (first sequence of 6-7 digits)
      const cnMatch = file.name.match(/^(\d{6,7})/);
      
      if (!cnMatch) {
        results.unmatched.push(file.name);
        console.log(`No CN found in filename: ${file.name}`);
        continue;
      }

      const cn = cnMatch[1];
      const product = productMap.get(cn);

      if (!product) {
        results.unmatched.push(file.name);
        console.log(`No product found for CN ${cn} (file: ${file.name})`);
        continue;
      }

      // Build public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(file.name);

      const publicUrl = urlData.publicUrl;

      // Update product with image URLs
      const { error: updateError } = await supabase
        .from('products')
        .update({
          thumbnail_url: publicUrl,
          main_image_url: publicUrl,
        })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
        results.errors.push(`${file.name}: ${updateError.message}`);
      } else {
        results.matched.push({
          fileName: file.name,
          productName: product.name,
          cn,
        });
        console.log(`Matched ${file.name} → ${product.name}`);
      }
    }

    console.log('Sync complete:', results);

    return new Response(JSON.stringify({
      success: true,
      summary: {
        totalFiles: files?.length || 0,
        matched: results.matched.length,
        unmatched: results.unmatched.length,
        errors: results.errors.length,
      },
      details: results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sync error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
