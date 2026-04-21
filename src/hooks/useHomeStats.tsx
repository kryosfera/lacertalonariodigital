import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface HomeStats {
  totalRecipes: number;
  totalPatients: number;
  thisMonth: number;
}

/**
 * Lightweight aggregated stats for the Home Bento.
 * Uses HEAD count queries so it doesn't fetch rows.
 */
export function useHomeStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["home-stats", user?.id],
    enabled: !!user,
    staleTime: 30 * 1000,
    queryFn: async (): Promise<HomeStats> => {
      if (!user) return { totalRecipes: 0, totalPatients: 0, thisMonth: 0 };

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [recipesRes, patientsRes, monthRes] = await Promise.all([
        supabase
          .from("recipes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("patients")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("recipes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth.toISOString()),
      ]);

      return {
        totalRecipes: recipesRes.count ?? 0,
        totalPatients: patientsRes.count ?? 0,
        thisMonth: monthRes.count ?? 0,
      };
    },
  });
}
