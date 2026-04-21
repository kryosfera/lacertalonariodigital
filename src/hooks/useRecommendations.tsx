import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Recommendation {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  kind: 'pdf' | 'video' | 'link';
  pdf_url: string | null;
  image_url: string | null;
  vimeo_id: string | null;
  vimeo_hash: string | null;
  vimeo_url: string | null;
  external_url: string | null;
  sort_order: number;
  is_visible: boolean;
}

export function useRecommendations(includeHidden = false) {
  return useQuery({
    queryKey: ['recommendations', includeHidden],
    queryFn: async () => {
      let q = supabase
        .from('recommendations')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!includeHidden) q = q.eq('is_visible', true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Recommendation[];
    },
    staleTime: 30_000,
  });
}
