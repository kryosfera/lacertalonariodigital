
-- Unified view: combine recipes (Pro) + quick_recipes for analytics
CREATE OR REPLACE VIEW public.all_recipes_unified AS
  SELECT id, created_at, products, sent_via, 'pro'::text AS source FROM public.recipes
  UNION ALL
  SELECT id, created_at, products, sent_via, 'quick'::text AS source FROM public.quick_recipes;

-- KPIs range: total/today/period/previous/avg_products use unified; dispensed only Pro
CREATE OR REPLACE FUNCTION public.admin_kpis_range(start_ts timestamp with time zone, end_ts timestamp with time zone)
 RETURNS TABLE(total_recipes bigint, today_count bigint, period_count bigint, previous_period_count bigint, avg_products_per_recipe numeric, dispensed_count bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH params AS (SELECT start_ts AS s, end_ts AS e, (end_ts - start_ts) AS dur),
  unified AS (
    SELECT created_at, products FROM recipes
    UNION ALL SELECT created_at, products FROM quick_recipes
  )
  SELECT
    (SELECT COUNT(*) FROM unified, params p WHERE created_at >= p.s AND created_at < p.e),
    (SELECT COUNT(*) FROM unified WHERE created_at >= date_trunc('day', now()) AND created_at < date_trunc('day', now()) + interval '1 day'),
    (SELECT COUNT(*) FROM unified, params p WHERE created_at >= p.s AND created_at < p.e),
    (SELECT COUNT(*) FROM unified, params p WHERE created_at >= (p.s - p.dur) AND created_at < p.s),
    (SELECT COALESCE(ROUND(AVG(jsonb_array_length(products))::numeric, 1), 0) FROM unified, params p WHERE jsonb_typeof(products) = 'array' AND created_at >= p.s AND created_at < p.e),
    (SELECT COUNT(*) FROM recipes, params p WHERE dispensed_at IS NOT NULL AND created_at >= p.s AND created_at < p.e);
END;
$function$;

-- Recipes per day
CREATE OR REPLACE FUNCTION public.admin_recipes_per_day(days integer DEFAULT 7)
 RETURNS TABLE(day date, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH series AS (SELECT generate_series((current_date - (days - 1))::date, current_date::date, interval '1 day')::date AS day),
  unified AS (SELECT created_at FROM recipes UNION ALL SELECT created_at FROM quick_recipes)
  SELECT s.day, COALESCE(COUNT(u.created_at), 0)::bigint FROM series s LEFT JOIN unified u ON date(u.created_at) = s.day
  GROUP BY s.day ORDER BY s.day;
END;
$function$;

-- Recipes per month
CREATE OR REPLACE FUNCTION public.admin_recipes_per_month()
 RETURNS TABLE(month text, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH unified AS (SELECT created_at FROM recipes UNION ALL SELECT created_at FROM quick_recipes)
  SELECT to_char(date_trunc('month', created_at), 'YYYY-MM'), COUNT(*)::bigint
  FROM unified WHERE created_at >= date_trunc('month', now()) - interval '5 months'
  GROUP BY date_trunc('month', created_at) ORDER BY date_trunc('month', created_at);
END;
$function$;

-- Timeseries
CREATE OR REPLACE FUNCTION public.admin_recipes_timeseries(start_ts timestamp with time zone, end_ts timestamp with time zone, bucket text DEFAULT 'day'::text)
 RETURNS TABLE(period timestamp with time zone, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE step interval;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF bucket NOT IN ('hour','day','week','month') THEN bucket := 'day'; END IF;
  step := ('1 ' || bucket)::interval;
  RETURN QUERY
  WITH series AS (SELECT generate_series(date_trunc(bucket, start_ts), date_trunc(bucket, end_ts - interval '1 second'), step) AS period),
  unified AS (SELECT created_at FROM recipes UNION ALL SELECT created_at FROM quick_recipes),
  agg AS (SELECT date_trunc(bucket, created_at) AS period, COUNT(*)::bigint AS total FROM unified WHERE created_at >= start_ts AND created_at < end_ts GROUP BY 1)
  SELECT s.period, COALESCE(a.total, 0) FROM series s LEFT JOIN agg a ON a.period = s.period ORDER BY s.period;
END;
$function$;

-- Heatmap (90 days)
CREATE OR REPLACE FUNCTION public.admin_activity_heatmap()
 RETURNS TABLE(weekday integer, hour integer, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH unified AS (SELECT created_at FROM recipes UNION ALL SELECT created_at FROM quick_recipes)
  SELECT EXTRACT(ISODOW FROM created_at)::int, EXTRACT(HOUR FROM created_at)::int, COUNT(*)::bigint
  FROM unified WHERE created_at >= now() - interval '90 days' GROUP BY 1, 2 ORDER BY 1, 2;
END;
$function$;

-- Heatmap range
CREATE OR REPLACE FUNCTION public.admin_activity_heatmap_range(start_ts timestamp with time zone, end_ts timestamp with time zone)
 RETURNS TABLE(weekday integer, hour integer, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH unified AS (SELECT created_at FROM recipes UNION ALL SELECT created_at FROM quick_recipes)
  SELECT EXTRACT(ISODOW FROM created_at)::int, EXTRACT(HOUR FROM created_at)::int, COUNT(*)::bigint
  FROM unified WHERE created_at >= start_ts AND created_at < end_ts GROUP BY 1, 2 ORDER BY 1, 2;
END;
$function$;

-- Top products (all-time)
CREATE OR REPLACE FUNCTION public.admin_top_products(lim integer DEFAULT 10)
 RETURNS TABLE(product_name text, reference text, times_prescribed bigint, thumbnail_url text)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH unified AS (SELECT products FROM recipes UNION ALL SELECT products FROM quick_recipes)
  SELECT elem->>'name', elem->>'reference', COUNT(*)::bigint, MAX(elem->>'thumbnail_url')
  FROM unified, jsonb_array_elements(products) AS elem
  GROUP BY 1, 2 ORDER BY 3 DESC LIMIT lim;
END;
$function$;

-- Top products range
CREATE OR REPLACE FUNCTION public.admin_top_products_range(start_ts timestamp with time zone, end_ts timestamp with time zone, lim integer DEFAULT 10)
 RETURNS TABLE(product_name text, reference text, times_prescribed bigint, thumbnail_url text)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH unified AS (
    SELECT products, created_at FROM recipes
    UNION ALL SELECT products, created_at FROM quick_recipes
  )
  SELECT elem->>'name', elem->>'reference', COUNT(*)::bigint, MAX(elem->>'thumbnail_url')
  FROM unified, jsonb_array_elements(products) AS elem
  WHERE created_at >= start_ts AND created_at < end_ts
  GROUP BY elem->>'name', elem->>'reference'
  ORDER BY COUNT(*) DESC LIMIT lim;
END;
$function$;

-- Send methods range
CREATE OR REPLACE FUNCTION public.admin_send_methods_range(start_ts timestamp with time zone, end_ts timestamp with time zone)
 RETURNS TABLE(method text, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH unified AS (
    SELECT sent_via, created_at FROM recipes
    UNION ALL SELECT sent_via, created_at FROM quick_recipes
  )
  SELECT COALESCE(sent_via, 'sin_envio'), COUNT(*)::bigint
  FROM unified WHERE created_at >= start_ts AND created_at < end_ts
  GROUP BY COALESCE(sent_via, 'sin_envio') ORDER BY 2 DESC;
END;
$function$;

-- Comparison
CREATE OR REPLACE FUNCTION public.admin_recipes_comparison()
 RETURNS TABLE(current_month bigint, previous_month bigint, today_count bigint, avg_products_per_recipe numeric)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH unified AS (
    SELECT created_at, products FROM recipes
    UNION ALL SELECT created_at, products FROM quick_recipes
  )
  SELECT
    (SELECT COUNT(*) FROM unified WHERE created_at >= date_trunc('month', now()))::bigint,
    (SELECT COUNT(*) FROM unified WHERE created_at >= date_trunc('month', now()) - interval '1 month' AND created_at < date_trunc('month', now()))::bigint,
    (SELECT COUNT(*) FROM unified WHERE created_at >= date_trunc('day', now()))::bigint,
    (SELECT COALESCE(ROUND(AVG(jsonb_array_length(products))::numeric, 1), 0) FROM unified WHERE jsonb_typeof(products) = 'array')::numeric;
END;
$function$;

-- ============================================================
-- NEW: Quick-only KPIs and breakdown
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_quick_kpis_range(start_ts timestamp with time zone, end_ts timestamp with time zone)
 RETURNS TABLE(total_quick bigint, period_quick bigint, today_quick bigint, previous_period_quick bigint, avg_products_quick numeric)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH params AS (SELECT start_ts AS s, end_ts AS e, (end_ts - start_ts) AS dur)
  SELECT
    (SELECT COUNT(*) FROM quick_recipes)::bigint,
    (SELECT COUNT(*) FROM quick_recipes, params p WHERE created_at >= p.s AND created_at < p.e)::bigint,
    (SELECT COUNT(*) FROM quick_recipes WHERE created_at >= date_trunc('day', now()))::bigint,
    (SELECT COUNT(*) FROM quick_recipes, params p WHERE created_at >= (p.s - p.dur) AND created_at < p.s)::bigint,
    (SELECT COALESCE(ROUND(AVG(jsonb_array_length(products))::numeric, 1), 0) FROM quick_recipes, params p WHERE jsonb_typeof(products) = 'array' AND created_at >= p.s AND created_at < p.e)::numeric;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_quick_top_products_range(start_ts timestamp with time zone, end_ts timestamp with time zone, lim integer DEFAULT 10)
 RETURNS TABLE(product_name text, reference text, times_prescribed bigint, thumbnail_url text)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT elem->>'name', elem->>'reference', COUNT(*)::bigint, MAX(elem->>'thumbnail_url')
  FROM quick_recipes, jsonb_array_elements(products) AS elem
  WHERE created_at >= start_ts AND created_at < end_ts
  GROUP BY elem->>'name', elem->>'reference'
  ORDER BY COUNT(*) DESC LIMIT lim;
END;
$function$;

-- Pro-only KPIs (for Pro vs Quick breakdown)
CREATE OR REPLACE FUNCTION public.admin_pro_kpis_range(start_ts timestamp with time zone, end_ts timestamp with time zone)
 RETURNS TABLE(total_pro bigint, period_pro bigint, today_pro bigint, previous_period_pro bigint, avg_products_pro numeric)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH params AS (SELECT start_ts AS s, end_ts AS e, (end_ts - start_ts) AS dur)
  SELECT
    (SELECT COUNT(*) FROM recipes)::bigint,
    (SELECT COUNT(*) FROM recipes, params p WHERE created_at >= p.s AND created_at < p.e)::bigint,
    (SELECT COUNT(*) FROM recipes WHERE created_at >= date_trunc('day', now()))::bigint,
    (SELECT COUNT(*) FROM recipes, params p WHERE created_at >= (p.s - p.dur) AND created_at < p.s)::bigint,
    (SELECT COALESCE(ROUND(AVG(jsonb_array_length(products))::numeric, 1), 0) FROM recipes, params p WHERE jsonb_typeof(products) = 'array' AND created_at >= p.s AND created_at < p.e)::numeric;
END;
$function$;
