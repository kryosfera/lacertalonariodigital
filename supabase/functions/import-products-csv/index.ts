import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  // Detect delimiter: comma or semicolon
  const header = lines[0];
  const delimiter = header.includes(';') ? ';' : ',';

  const headers = header.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] || '').replace(/^"|"$/g, '').trim();
    });
    return row;
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Admin check using service role
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: roleData } = await serviceClient
    .from('user_roles')
    .select('role')
    .eq('user_id', claimsData.claims.sub)
    .eq('role', 'admin')
    .maybeSingle();

  if (!roleData) {
    return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { csv } = body as { csv: string };

    if (!csv || typeof csv !== 'string') {
      return new Response(JSON.stringify({ error: 'csv field is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rows = parseCSV(csv);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'No rows found in CSV' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all categories for name->id mapping
    const { data: categories } = await serviceClient
      .from('categories')
      .select('id, name, slug');

    const categoryByName: Record<string, string> = {};
    const categoryBySlug: Record<string, string> = {};
    for (const cat of categories || []) {
      categoryByName[cat.name.toLowerCase()] = cat.id;
      categoryBySlug[cat.slug.toLowerCase()] = cat.id;
    }

    const results = { inserted: 0, updated: 0, errors: [] as string[] };

    // Process in batches of 50
    const BATCH = 50;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const upsertPayload = [];

      const sanitize = (val: string | null | undefined): string | null => {
        if (val == null) return null;
        const s = String(val);
        if (!s) return null;
        // Prevent CSV formula injection in re-exports
        return /^[=+\-@]/.test(s) ? "'" + s : s;
      };

      for (const row of batch) {
        const rawName = row['name'] || row['nombre'] || row['producto'] || '';
        const name = sanitize(rawName) || '';
        if (!name || name.length > 500) {
          results.errors.push(`Fila ${i + upsertPayload.length + 1}: nombre inválido`);
          continue;
        }

        const slug = (row['slug'] || generateSlug(name)).toLowerCase();
        if (!/^[a-z0-9-]+$/.test(slug) || slug.length > 200) {
          results.errors.push(`Fila ${i + upsertPayload.length + 1}: slug inválido`);
          continue;
        }

        const ean = row['ean'] || null;
        if (ean && !/^\d{8,14}$/.test(ean)) {
          results.errors.push(`Fila ${i + upsertPayload.length + 1}: EAN inválido`);
          continue;
        }

        const reference = row['reference'] || row['referencia'] || row['cn'] || null;
        if (reference && reference.length > 50) {
          results.errors.push(`Fila ${i + upsertPayload.length + 1}: referencia demasiado larga`);
          continue;
        }

        const catRaw = (row['category'] || row['categoria'] || row['categoría'] || '').toLowerCase();
        let category_id: string | null = null;
        if (catRaw) {
          category_id = categoryByName[catRaw] || categoryBySlug[catRaw] || null;
        }

        const sort_order = row['sort_order'] || row['orden'] ? parseInt(row['sort_order'] || row['orden'], 10) : 0;

        const descHtml = row['description'] || row['descripcion'] || null;
        if (descHtml && descHtml.length > 50000) {
          results.errors.push(`Fila ${i + upsertPayload.length + 1}: descripción demasiado larga`);
          continue;
        }

        upsertPayload.push({
          name,
          slug,
          reference: sanitize(reference),
          ean,
          seo_title: sanitize(row['seo_title'] || row['titulo_seo'])?.slice(0, 200) || null,
          seo_description: sanitize(row['seo_description'] || row['descripcion_seo'])?.slice(0, 500) || null,
          description_html: descHtml,
          category_id,
          sort_order: isNaN(sort_order) ? 0 : sort_order,
          is_active: row['is_active'] !== 'false' && row['activo'] !== 'false',
          is_visible: row['is_visible'] !== 'false' && row['visible'] !== 'false',
        });
      }

      if (upsertPayload.length === 0) continue;

      const { data: upserted, error: upsertError } = await serviceClient
        .from('products')
        .upsert(upsertPayload, {
          onConflict: 'slug',
          ignoreDuplicates: false,
        })
        .select('id');

      if (upsertError) {
        results.errors.push(`Lote ${Math.floor(i / BATCH) + 1}: ${upsertError.message}`);
      } else {
        results.inserted += upserted?.length || 0;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: rows.length,
          processed: results.inserted + results.updated,
          errors: results.errors.length,
        },
        errors: results.errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
