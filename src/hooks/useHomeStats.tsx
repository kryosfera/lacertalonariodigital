import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
 *
 * Always-fresh strategy:
 *  - staleTime 0 + refetchOnMount 'always' → coming back to Home always refetches.
 *  - Realtime subscription on `recipes` and `patients` filtered by user_id
 *    invalidates the cache as soon as data changes (other tabs, devices, etc.).
 */
export function useHomeStats() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ["home-stats", userId],
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    queryFn: async (): Promise<HomeStats> => {
      if (!userId) return { totalRecipes: 0, totalPatients: 0, thisMonth: 0 };

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [recipesRes, patientsRes, monthRes] = await Promise.all([
        supabase
          .from("recipes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("patients")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("recipes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", startOfMonth.toISOString()),
      ]);

      return {
        totalRecipes: recipesRes.count ?? 0,
        totalPatients: patientsRes.count ?? 0,
        thisMonth: monthRes.count ?? 0,
      };
    },
  });

  // Realtime: invalidate cache whenever this user's recipes/patients change
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`home-stats-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recipes", filter: `user_id=eq.${userId}` },
        () => queryClient.invalidateQueries({ queryKey: ["home-stats", userId] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients", filter: `user_id=eq.${userId}` },
        () => queryClient.invalidateQueries({ queryKey: ["home-stats", userId] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
}
