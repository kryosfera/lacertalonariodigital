CREATE OR REPLACE FUNCTION public.admin_recipes_timeseries_by_source(start_ts timestamp with time zone, end_ts timestamp with time zone, bucket text DEFAULT 'day'::text, source text DEFAULT 'all'::text)
 RETURNS TABLE(period timestamp with time zone, total bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE step interval;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF bucket NOT IN ('hour','day','week','month') THEN bucket := 'day'; END IF;
  IF source NOT IN ('all','pro','quick') THEN source := 'all'; END IF;
  step := ('1 ' || bucket)::interval;
  RETURN QUERY
  WITH series AS (
    SELECT generate_series(date_trunc(bucket, start_ts), date_trunc(bucket, end_ts - interval '1 second'), step) AS period
  ),
  unified AS (
    SELECT created_at FROM recipes WHERE source IN ('all','pro')
    UNION ALL
    SELECT created_at FROM quick_recipes WHERE source IN ('all','quick')
  ),
  agg AS (
    SELECT date_trunc(bucket, created_at) AS period, COUNT(*)::bigint AS total
    FROM unified WHERE created_at >= start_ts AND created_at < end_ts
    GROUP BY 1
  )
  SELECT s.period, COALESCE(a.total, 0) FROM series s LEFT JOIN agg a ON a.period = s.period ORDER BY s.period;
END;
$function$;