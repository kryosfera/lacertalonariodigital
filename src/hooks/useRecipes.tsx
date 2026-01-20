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

export function useRecipes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recipes', user?.id],
    queryFn: async (): Promise<Recipe[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(recipe => ({
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
    },
    enabled: !!user
  });
}

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
