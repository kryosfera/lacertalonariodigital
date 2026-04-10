import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Recipe, RecipeProduct } from "./useRecipes";

export function usePatientRecipes(patientId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patient-recipes', user?.id, patientId],
    queryFn: async (): Promise<Recipe[]> => {
      if (!user || !patientId) return [];

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .eq('patient_id', patientId)
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
        dispensed_at: recipe.dispensed_at,
        dispensed_by: recipe.dispensed_by,
        products: (recipe.products as unknown as RecipeProduct[]) || []
      }));
    },
    enabled: !!user && !!patientId,
    staleTime: 30 * 1000,
  });
}
