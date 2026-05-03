import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Auth check: require valid JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Admin role check
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', claimsData.claims.sub)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin only' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting image sync...');

    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 1000 });
    if (listError) throw listError;

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, reference, ean');
    if (productsError) throw productsError;

    const productMap = new Map<string, { id: string; name: string }>();
    products?.forEach((product) => {
      if (product.reference) {
        const cleanRef = product.reference.replace(/\./g, '');
        productMap.set(cleanRef, { id: product.id, name: product.name });
      }
      if (product.ean && product.ean.length >= 7) {
        const eanSuffix = product.ean.slice(-7);
        if (!productMap.has(eanSuffix)) {
          productMap.set(eanSuffix, { id: product.id, name: product.name });
        }
      }
    });

    const results = {
      matched: [] as { fileName: string; productName: string; cn: string }[],
      unmatched: [] as string[],
      errors: [] as string[],
    };

    for (const file of files || []) {
      if (!file.name || file.metadata?.mimetype === 'application/octet-stream') continue;
      const cnMatch = file.name.match(/^(\d{6,7})/);
      if (!cnMatch) { results.unmatched.push(file.name); continue; }
      const cn = cnMatch[1];
      const product = productMap.get(cn);
      if (!product) { results.unmatched.push(file.name); continue; }

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(file.name);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('products')
        .update({ thumbnail_url: publicUrl, main_image_url: publicUrl })
        .eq('id', product.id);

      if (updateError) {
        results.errors.push(`${file.name}: ${updateError.message}`);
      } else {
        results.matched.push({ fileName: file.name, productName: product.name, cn });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      summary: {
        totalFiles: files?.length || 0,
        matched: results.matched.length,
        unmatched: results.unmatched.length,
        errors: results.errors.length,
      },
      details: results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sync error:', error);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
