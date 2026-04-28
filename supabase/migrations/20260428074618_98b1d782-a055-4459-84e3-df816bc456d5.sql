
REVOKE EXECUTE ON FUNCTION public.admin_kpis_range(timestamptz, timestamptz) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_recipes_timeseries(timestamptz, timestamptz, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_top_products_range(timestamptz, timestamptz, integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_province_stats_range(timestamptz, timestamptz) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_top_professionals_range(timestamptz, timestamptz, integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_activity_heatmap_range(timestamptz, timestamptz) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_send_methods_range(timestamptz, timestamptz) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_kpis_range(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_recipes_timeseries(timestamptz, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_top_products_range(timestamptz, timestamptz, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_province_stats_range(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_top_professionals_range(timestamptz, timestamptz, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_activity_heatmap_range(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_send_methods_range(timestamptz, timestamptz) TO authenticated;
