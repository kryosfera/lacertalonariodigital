import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncResult {
  matched: number;
  unmatched: number;
}

interface SyncDetails {
  matched: { filename: string; categoryName: string; categoryId: string }[];
  unmatched: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting category image sync...');

    // List all files in the category-images bucket
    const { data: files, error: listError } = await supabase.storage
      .from('category-images')
      .list('', { limit: 1000 });

    if (listError) {
      console.error('Error listing files:', listError);
      throw new Error(`Error listing files: ${listError.message}`);
    }

    console.log(`Found ${files?.length || 0} files in category-images bucket`);

    // Get all categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug');

    if (catError) {
      console.error('Error fetching categories:', catError);
      throw new Error(`Error fetching categories: ${catError.message}`);
    }

    console.log(`Found ${categories?.length || 0} categories`);

    const result: SyncResult = { matched: 0, unmatched: 0 };
    const details: SyncDetails = { matched: [], unmatched: [] };

    // Helper function to normalize strings for matching
    const normalize = (str: string): string => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric
    };

    // Process each file
    for (const file of files || []) {
      // Skip folders
      if (!file.name || file.metadata?.mimetype === 'application/x-directory') {
        continue;
      }

      // Extract filename without extension
      const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const normalizedFilename = normalize(filenameWithoutExt);

      console.log(`Processing file: ${file.name} (normalized: ${normalizedFilename})`);

      // Find matching category
      const matchedCategory = categories?.find(cat => {
        const normalizedSlug = normalize(cat.slug);
        const normalizedName = normalize(cat.name);
        
        return normalizedSlug === normalizedFilename || 
               normalizedName === normalizedFilename ||
               normalizedSlug.includes(normalizedFilename) ||
               normalizedFilename.includes(normalizedSlug);
      });

      if (matchedCategory) {
        // Get public URL for the image
        const { data: urlData } = supabase.storage
          .from('category-images')
          .getPublicUrl(file.name);

        // Update category with image URL
        const { error: updateError } = await supabase
          .from('categories')
          .update({ image_url: urlData.publicUrl })
          .eq('id', matchedCategory.id);

        if (updateError) {
          console.error(`Error updating category ${matchedCategory.name}:`, updateError);
        } else {
          console.log(`Matched: ${file.name} -> ${matchedCategory.name}`);
          result.matched++;
          details.matched.push({
            filename: file.name,
            categoryName: matchedCategory.name,
            categoryId: matchedCategory.id,
          });
        }
      } else {
        console.log(`No match found for: ${file.name}`);
        result.unmatched++;
        details.unmatched.push(file.name);
      }
    }

    console.log('Sync completed:', result);

    return new Response(
      JSON.stringify({
        success: true,
        summary: result,
        details: details,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
