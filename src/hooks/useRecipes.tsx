import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface RecipeProduct {
  id: string;
  name: string;
  reference: string;
  ean?: string | null;
  quantity: number;
  thumbnail_url?: string | null;
}

export interface Recipe {
  id: string;
  user_id: string;
  patient_id: string | null;
  patient_name: string;
  products: RecipeProduct[];
  notes: string | null;
  sent_via: string | null;
  created_at: string;
  recipe_code: string | null;
}

export interface CreateRecipeData {
  patient_id?: string | null;
  patient_name: string;
  products: RecipeProduct[];
  notes?: string;
  sent_via: 'whatsapp' | 'email' | 'both' | 'pdf' | 'print';
}

const PAGE_SIZE = 20;

export function useRecipes(page = 0) {
  const { user } = useAuth();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  return useQuery({
    queryKey: ['recipes', user?.id, page],
    queryFn: async (): Promise<{ recipes: Recipe[]; hasMore: boolean }> => {
      if (!user) return { recipes: [], hasMore: false };

      const { data, error, count } = await supabase
        .from('recipes')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const recipes = (data || []).map(recipe => ({
        id: recipe.id,
        user_id: recipe.user_id,
        patient_id: recipe.patient_id,
        patient_name: recipe.patient_name,
        notes: recipe.notes,
        sent_via: recipe.sent_via,
        created_at: recipe.created_at,
        recipe_code: recipe.recipe_code,
        products: (recipe.products as unknown as RecipeProduct[]) || []
      }));

      const hasMore = count ? from + PAGE_SIZE < count : false;
      return { recipes, hasMore };
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds — recipes are more dynamic
  });
}

export { PAGE_SIZE };

export function useCreateRecipe() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRecipeData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: recipe, error } = await supabase
        .from('recipes')
        .insert([{
          user_id: user.id,
          patient_id: data.patient_id || null,
          patient_name: data.patient_name,
          products: JSON.parse(JSON.stringify(data.products)),
          notes: data.notes || null,
          sent_via: data.sent_via
        }])
        .select()
        .single();

      if (error) throw error;
      return recipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] }); // Update recipe counts
    },
    onError: (error) => {
      console.error('Error creating recipe:', error);
      toast.error('Error al guardar la receta');
    }
  });
}
