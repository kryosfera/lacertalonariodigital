CREATE OR REPLACE FUNCTION public.admin_send_hours_range(start_ts timestamp with time zone, end_ts timestamp with time zone, source text DEFAULT 'all'::text)
RETURNS TABLE(hour integer, total bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF source NOT IN ('all','pro','quick') THEN source := 'all'; END IF;
  RETURN QUERY
  WITH unified AS (
    SELECT created_at FROM recipes WHERE source IN ('all','pro')
    UNION ALL
    SELECT created_at FROM quick_recipes WHERE source IN ('all','quick')
  ),
  series AS (SELECT generate_series(0,23) AS hour),
  agg AS (
    SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Madrid')::int AS hour, COUNT(*)::bigint AS total
    FROM unified WHERE created_at >= start_ts AND created_at < end_ts
    GROUP BY 1
  )
  SELECT s.hour, COALESCE(a.total, 0) FROM series s LEFT JOIN agg a ON a.hour = s.hour ORDER BY s.hour;
END;
$function$;