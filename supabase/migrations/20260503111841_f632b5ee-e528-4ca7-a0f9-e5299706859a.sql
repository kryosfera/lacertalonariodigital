
-- 1. Add admin role check to all admin_* RPC functions and revoke public EXECUTE

CREATE OR REPLACE FUNCTION public.admin_kpis_range(start_ts timestamp with time zone, end_ts timestamp with time zone)
 RETURNS TABLE(total_recipes bigint, today_count bigint, period_count bigint, previous_period_count bigint, avg_products_per_recipe numeric, dispensed_count bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH params AS (SELECT start_ts AS s, end_ts AS e, (end_ts - start_ts) AS dur)
  SELECT
    (SELECT COUNT(*) FROM recipes WHERE created_at >= p.s AND created_at < p.e),
    (SELECT COUNT(*) FROM recipes WHERE created_at >= date_trunc('day', now()) AND created_at < date_trunc('day', now()) + interval '1 day'),
    (SELECT COUNT(*) FROM recipes WHERE created_at >= p.s AND created_at < p.e),
    (SELECT COUNT(*) FROM recipes WHERE created_at >= (p.s - p.dur) AND created_at < p.s),
    (SELECT COALESCE(ROUND(AVG(jsonb_array_length(products))::numeric, 1), 0) FROM recipes WHERE jsonb_typeof(products) = 'array' AND created_at >= p.s AND created_at < p.e),
    (SELECT COUNT(*) FROM recipes WHERE dispensed_at IS NOT NULL AND created_at >= p.s AND created_at < p.e)
  FROM params p;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_recipes_timeseries(start_ts timestamp with time zone, end_ts timestamp with time zone, bucket text DEFAULT 'day')
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
  agg AS (SELECT date_trunc(bucket, created_at) AS period, COUNT(*)::bigint AS total FROM recipes WHERE created_at >= start_ts AND created_at < end_ts GROUP BY 1)
  SELECT s.period, COALESCE(a.total, 0) FROM series s LEFT JOIN agg a ON a.period = s.period ORDER BY s.period;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_top_products_range(start_ts timestamp with time zone, end_ts timestamp with time zone, lim integer DEFAULT 10)
 RETURNS TABLE(product_name text, reference text, times_prescribed bigint, thumbnail_url text)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT elem->>'name', elem->>'reference', COUNT(*)::bigint, MAX(elem->>'thumbnail_url')
  FROM recipes, jsonb_array_elements(products) AS elem
  WHERE created_at >= start_ts AND created_at < end_ts
  GROUP BY elem->>'name', elem->>'reference'
  ORDER BY COUNT(*) DESC LIMIT lim;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_province_stats_range(start_ts timestamp with time zone, end_ts timestamp with time zone)
 RETURNS TABLE(province text, professionals bigint, total_recipes bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT COALESCE(p.province, 'Sin provincia'), COUNT(DISTINCT p.user_id), COUNT(r.id)
  FROM profiles p LEFT JOIN recipes r ON r.user_id = p.user_id AND r.created_at >= start_ts AND r.created_at < end_ts
  GROUP BY p.province ORDER BY COUNT(r.id) DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_top_professionals_range(start_ts timestamp with time zone, end_ts timestamp with time zone, lim integer DEFAULT 10)
 RETURNS TABLE(user_id uuid, clinic_name text, professional_name text, province text, locality text, total_recipes bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT p.user_id, p.clinic_name, p.professional_name, p.province, p.locality, COUNT(r.id)::bigint
  FROM profiles p LEFT JOIN recipes r ON r.user_id = p.user_id AND r.created_at >= start_ts AND r.created_at < end_ts
  GROUP BY p.user_id, p.clinic_name, p.professional_name, p.province, p.locality
  ORDER BY COUNT(r.id) DESC LIMIT lim;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_activity_heatmap_range(start_ts timestamp with time zone, end_ts timestamp with time zone)
 RETURNS TABLE(weekday integer, hour integer, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT EXTRACT(ISODOW FROM created_at)::int, EXTRACT(HOUR FROM created_at)::int, COUNT(*)::bigint
  FROM recipes WHERE created_at >= start_ts AND created_at < end_ts GROUP BY 1, 2 ORDER BY 1, 2;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_send_methods_range(start_ts timestamp with time zone, end_ts timestamp with time zone)
 RETURNS TABLE(method text, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT COALESCE(sent_via, 'sin_envio'), COUNT(*)::bigint
  FROM recipes WHERE created_at >= start_ts AND created_at < end_ts
  GROUP BY COALESCE(sent_via, 'sin_envio') ORDER BY 2 DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_top_products(lim integer DEFAULT 10)
 RETURNS TABLE(product_name text, reference text, times_prescribed bigint, thumbnail_url text)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT elem->>'name', elem->>'reference', COUNT(*)::bigint, MAX(elem->>'thumbnail_url')
  FROM recipes, jsonb_array_elements(products) AS elem
  GROUP BY 1, 2 ORDER BY 3 DESC LIMIT lim;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_province_stats()
 RETURNS TABLE(province text, professionals bigint, total_recipes bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT COALESCE(p.province, 'Sin provincia'), COUNT(DISTINCT p.user_id), COUNT(r.id)
  FROM profiles p LEFT JOIN recipes r ON r.user_id = p.user_id
  GROUP BY p.province ORDER BY COUNT(r.id) DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_top_professionals(lim integer DEFAULT 10)
 RETURNS TABLE(user_id uuid, clinic_name text, professional_name text, province text, locality text, total_recipes bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT p.user_id, p.clinic_name, p.professional_name, p.province, p.locality, COUNT(r.id)::bigint
  FROM profiles p LEFT JOIN recipes r ON r.user_id = p.user_id
  GROUP BY p.user_id, p.clinic_name, p.professional_name, p.province, p.locality
  ORDER BY COUNT(r.id) DESC LIMIT lim;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_recipes_per_day(days integer DEFAULT 7)
 RETURNS TABLE(day date, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH series AS (SELECT generate_series((current_date - (days - 1))::date, current_date::date, interval '1 day')::date AS day)
  SELECT s.day, COALESCE(COUNT(r.id), 0)::bigint FROM series s LEFT JOIN recipes r ON date(r.created_at) = s.day
  GROUP BY s.day ORDER BY s.day;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_activity_heatmap()
 RETURNS TABLE(weekday integer, hour integer, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT EXTRACT(ISODOW FROM created_at)::int, EXTRACT(HOUR FROM created_at)::int, COUNT(*)::bigint
  FROM recipes WHERE created_at >= now() - interval '90 days' GROUP BY 1, 2 ORDER BY 1, 2;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_recipes_comparison()
 RETURNS TABLE(current_month bigint, previous_month bigint, today_count bigint, avg_products_per_recipe numeric)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM recipes WHERE created_at >= date_trunc('month', now()))::bigint,
    (SELECT COUNT(*) FROM recipes WHERE created_at >= date_trunc('month', now()) - interval '1 month' AND created_at < date_trunc('month', now()))::bigint,
    (SELECT COUNT(*) FROM recipes WHERE created_at >= date_trunc('day', now()))::bigint,
    (SELECT COALESCE(ROUND(AVG(jsonb_array_length(products))::numeric, 1), 0) FROM recipes WHERE jsonb_typeof(products) = 'array')::numeric;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_recipes_per_month()
 RETURNS TABLE(month text, total bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT to_char(date_trunc('month', created_at), 'YYYY-MM'), COUNT(*)::bigint
  FROM recipes WHERE created_at >= date_trunc('month', now()) - interval '5 months'
  GROUP BY date_trunc('month', created_at) ORDER BY date_trunc('month', created_at);
END;
$function$;

-- Revoke public EXECUTE on admin_* functions
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname LIKE 'admin\_%' ESCAPE '\'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon', r.nspname, r.proname, r.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO authenticated', r.nspname, r.proname, r.args);
  END LOOP;
END $$;

-- 2. Trigger to restrict anonymous UPDATE on recipes to only dispensed_at + dispensed_by
CREATE OR REPLACE FUNCTION public.restrict_anonymous_recipe_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If this is the owner, allow any update
  IF auth.uid() IS NOT NULL AND auth.uid() = OLD.user_id THEN
    RETURN NEW;
  END IF;

  -- Anonymous / non-owner: only dispensed_at and dispensed_by may change
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.patient_id IS DISTINCT FROM OLD.patient_id
     OR NEW.patient_name IS DISTINCT FROM OLD.patient_name
     OR NEW.products IS DISTINCT FROM OLD.products
     OR NEW.notes IS DISTINCT FROM OLD.notes
     OR NEW.sent_via IS DISTINCT FROM OLD.sent_via
     OR NEW.recipe_code IS DISTINCT FROM OLD.recipe_code
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Only dispensed_at and dispensed_by can be updated by non-owners';
  END IF;

  -- Only allow setting dispensation once (avoid overwriting)
  IF OLD.dispensed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Recipe already dispensed';
  END IF;

  -- Validate length of dispensed_by (anti-abuse)
  IF NEW.dispensed_by IS NOT NULL AND length(NEW.dispensed_by) > 200 THEN
    RAISE EXCEPTION 'dispensed_by too long';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_restrict_anonymous_recipe_update ON public.recipes;
CREATE TRIGGER trg_restrict_anonymous_recipe_update
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.restrict_anonymous_recipe_update();

-- 3. Storage: scope profile uploads/updates to user's own folder
DROP POLICY IF EXISTS "Users can upload profile files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update profile files" ON storage.objects;

CREATE POLICY "Users can upload own profile files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'recomendaciones'
  AND (storage.foldername(name))[1] = 'profiles'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can update own profile files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'recomendaciones'
  AND (storage.foldername(name))[1] = 'profiles'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'recomendaciones'
  AND (storage.foldername(name))[1] = 'profiles'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
