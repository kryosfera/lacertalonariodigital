CREATE OR REPLACE FUNCTION public.admin_recipes_per_day(days integer DEFAULT 7)
 RETURNS TABLE(day date, total bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH series AS (
    SELECT generate_series(
      (current_date - (days - 1))::date,
      current_date::date,
      interval '1 day'
    )::date AS day
  )
  SELECT s.day, COALESCE(COUNT(r.id), 0) AS total
  FROM series s
  LEFT JOIN recipes r ON date(r.created_at) = s.day
  GROUP BY s.day
  ORDER BY s.day;
$function$;

CREATE OR REPLACE FUNCTION public.admin_activity_heatmap()
 RETURNS TABLE(weekday integer, hour integer, total bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    EXTRACT(ISODOW FROM created_at)::int AS weekday,
    EXTRACT(HOUR FROM created_at)::int AS hour,
    COUNT(*) AS total
  FROM recipes
  WHERE created_at >= now() - interval '90 days'
  GROUP BY weekday, hour
  ORDER BY weekday, hour;
$function$;

CREATE OR REPLACE FUNCTION public.admin_recipes_comparison()
 RETURNS TABLE(current_month bigint, previous_month bigint, today_count bigint, avg_products_per_recipe numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    (SELECT COUNT(*) FROM recipes WHERE created_at >= date_trunc('month', now())) AS current_month,
    (SELECT COUNT(*) FROM recipes WHERE created_at >= date_trunc('month', now()) - interval '1 month' AND created_at < date_trunc('month', now())) AS previous_month,
    (SELECT COUNT(*) FROM recipes WHERE created_at >= date_trunc('day', now())) AS today_count,
    (SELECT COALESCE(ROUND(AVG(jsonb_array_length(products))::numeric, 1), 0) FROM recipes WHERE jsonb_typeof(products) = 'array') AS avg_products_per_recipe;
$function$;