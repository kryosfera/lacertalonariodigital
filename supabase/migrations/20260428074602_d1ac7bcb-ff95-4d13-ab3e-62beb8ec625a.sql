
-- KPIs for a given range with comparison vs equivalent previous period
CREATE OR REPLACE FUNCTION public.admin_kpis_range(start_ts timestamptz, end_ts timestamptz)
RETURNS TABLE(
  total_recipes bigint,
  today_count bigint,
  period_count bigint,
  previous_period_count bigint,
  avg_products_per_recipe numeric,
  dispensed_count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH params AS (
    SELECT start_ts AS s, end_ts AS e, (end_ts - start_ts) AS dur
  )
  SELECT
    (SELECT COUNT(*) FROM recipes WHERE created_at >= p.s AND created_at < p.e) AS total_recipes,
    (SELECT COUNT(*) FROM recipes WHERE created_at >= date_trunc('day', now()) AND created_at < date_trunc('day', now()) + interval '1 day') AS today_count,
    (SELECT COUNT(*) FROM recipes WHERE created_at >= p.s AND created_at < p.e) AS period_count,
    (SELECT COUNT(*) FROM recipes WHERE created_at >= (p.s - p.dur) AND created_at < p.s) AS previous_period_count,
    (SELECT COALESCE(ROUND(AVG(jsonb_array_length(products))::numeric, 1), 0)
       FROM recipes WHERE jsonb_typeof(products) = 'array'
         AND created_at >= p.s AND created_at < p.e) AS avg_products_per_recipe,
    (SELECT COUNT(*) FROM recipes WHERE dispensed_at IS NOT NULL
       AND created_at >= p.s AND created_at < p.e) AS dispensed_count
  FROM params p;
$$;

-- Time series with dynamic bucket
CREATE OR REPLACE FUNCTION public.admin_recipes_timeseries(start_ts timestamptz, end_ts timestamptz, bucket text DEFAULT 'day')
RETURNS TABLE(period timestamptz, total bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  step interval;
BEGIN
  IF bucket NOT IN ('hour','day','week','month') THEN
    bucket := 'day';
  END IF;
  step := ('1 ' || bucket)::interval;

  RETURN QUERY
  WITH series AS (
    SELECT generate_series(date_trunc(bucket, start_ts), date_trunc(bucket, end_ts - interval '1 second'), step) AS period
  ),
  agg AS (
    SELECT date_trunc(bucket, created_at) AS period, COUNT(*)::bigint AS total
    FROM recipes
    WHERE created_at >= start_ts AND created_at < end_ts
    GROUP BY 1
  )
  SELECT s.period, COALESCE(a.total, 0) AS total
  FROM series s LEFT JOIN agg a ON a.period = s.period
  ORDER BY s.period;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_top_products_range(start_ts timestamptz, end_ts timestamptz, lim integer DEFAULT 10)
RETURNS TABLE(product_name text, reference text, times_prescribed bigint, thumbnail_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT elem->>'name', elem->>'reference', COUNT(*)::bigint, MAX(elem->>'thumbnail_url')
  FROM recipes, jsonb_array_elements(products) AS elem
  WHERE created_at >= start_ts AND created_at < end_ts
  GROUP BY elem->>'name', elem->>'reference'
  ORDER BY COUNT(*) DESC
  LIMIT lim;
$$;

CREATE OR REPLACE FUNCTION public.admin_province_stats_range(start_ts timestamptz, end_ts timestamptz)
RETURNS TABLE(province text, professionals bigint, total_recipes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COALESCE(p.province, 'Sin provincia'),
    COUNT(DISTINCT p.user_id),
    COUNT(r.id)
  FROM profiles p
  LEFT JOIN recipes r ON r.user_id = p.user_id
    AND r.created_at >= start_ts AND r.created_at < end_ts
  GROUP BY p.province
  ORDER BY COUNT(r.id) DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_top_professionals_range(start_ts timestamptz, end_ts timestamptz, lim integer DEFAULT 10)
RETURNS TABLE(user_id uuid, clinic_name text, professional_name text, province text, locality text, total_recipes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.user_id, p.clinic_name, p.professional_name, p.province, p.locality, COUNT(r.id)::bigint
  FROM profiles p
  LEFT JOIN recipes r ON r.user_id = p.user_id
    AND r.created_at >= start_ts AND r.created_at < end_ts
  GROUP BY p.user_id, p.clinic_name, p.professional_name, p.province, p.locality
  ORDER BY COUNT(r.id) DESC
  LIMIT lim;
$$;

CREATE OR REPLACE FUNCTION public.admin_activity_heatmap_range(start_ts timestamptz, end_ts timestamptz)
RETURNS TABLE(weekday integer, hour integer, total bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXTRACT(ISODOW FROM created_at)::int, EXTRACT(HOUR FROM created_at)::int, COUNT(*)::bigint
  FROM recipes
  WHERE created_at >= start_ts AND created_at < end_ts
  GROUP BY 1, 2
  ORDER BY 1, 2;
$$;

CREATE OR REPLACE FUNCTION public.admin_send_methods_range(start_ts timestamptz, end_ts timestamptz)
RETURNS TABLE(method text, total bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(sent_via, 'sin_envio'), COUNT(*)::bigint
  FROM recipes
  WHERE created_at >= start_ts AND created_at < end_ts
  GROUP BY COALESCE(sent_via, 'sin_envio')
  ORDER BY 2 DESC;
$$;
