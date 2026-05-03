import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    const { data: files, error: listError } = await supabase.storage
      .from('category-images')
      .list('', { limit: 1000 });
    if (listError) throw new Error(`Error listing files: ${listError.message}`);

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug');
    if (catError) throw new Error(`Error fetching categories: ${catError.message}`);

    const result = { matched: 0, unmatched: 0 };
    const details = {
      matched: [] as { filename: string; categoryName: string; categoryId: string }[],
      unmatched: [] as string[],
    };

    const normalize = (str: string): string =>
      str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

    for (const file of files || []) {
      if (!file.name || file.metadata?.mimetype === 'application/x-directory') continue;
      const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const normalizedFilename = normalize(filenameWithoutExt);

      const matchedCategory = categories?.find(cat => {
        const ns = normalize(cat.slug);
        const nn = normalize(cat.name);
        return ns === normalizedFilename || nn === normalizedFilename ||
               ns.includes(normalizedFilename) || normalizedFilename.includes(ns);
      });

      if (matchedCategory) {
        const { data: urlData } = supabase.storage.from('category-images').getPublicUrl(file.name);
        const { error: updateError } = await supabase
          .from('categories')
          .update({ image_url: urlData.publicUrl })
          .eq('id', matchedCategory.id);
        if (!updateError) {
          result.matched++;
          details.matched.push({ filename: file.name, categoryName: matchedCategory.name, categoryId: matchedCategory.id });
        }
      } else {
        result.unmatched++;
        details.unmatched.push(file.name);
      }
    }

    return new Response(JSON.stringify({ success: true, summary: result, details }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sync error:', error);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
