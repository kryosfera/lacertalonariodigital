
-- 1) User overview KPIs
CREATE OR REPLACE FUNCTION public.admin_user_overview(target_user uuid)
RETURNS TABLE(
  total_recipes bigint,
  current_month bigint,
  previous_month bigint,
  today_count bigint,
  dispensed_count bigint,
  dispensation_rate numeric,
  avg_products_per_recipe numeric,
  total_patients bigint,
  last_recipe_at timestamp with time zone,
  first_recipe_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM recipes WHERE user_id = target_user)::bigint,
    (SELECT COUNT(*) FROM recipes WHERE user_id = target_user AND created_at >= date_trunc('month', now()))::bigint,
    (SELECT COUNT(*) FROM recipes WHERE user_id = target_user
       AND created_at >= date_trunc('month', now()) - interval '1 month'
       AND created_at < date_trunc('month', now()))::bigint,
    (SELECT COUNT(*) FROM recipes WHERE user_id = target_user AND created_at >= date_trunc('day', now()))::bigint,
    (SELECT COUNT(*) FROM recipes WHERE user_id = target_user AND dispensed_at IS NOT NULL)::bigint,
    (SELECT CASE WHEN COUNT(*) = 0 THEN 0
              ELSE ROUND((COUNT(*) FILTER (WHERE dispensed_at IS NOT NULL)::numeric / COUNT(*)::numeric) * 100, 1)
            END
       FROM recipes WHERE user_id = target_user)::numeric,
    (SELECT COALESCE(ROUND(AVG(jsonb_array_length(products))::numeric, 1), 0)
       FROM recipes WHERE user_id = target_user AND jsonb_typeof(products) = 'array')::numeric,
    (SELECT COUNT(*) FROM patients WHERE user_id = target_user)::bigint,
    (SELECT MAX(created_at) FROM recipes WHERE user_id = target_user),
    (SELECT MIN(created_at) FROM recipes WHERE user_id = target_user);
END;
$$;

-- 2) Time series of recipes for a user
CREATE OR REPLACE FUNCTION public.admin_user_recipes_timeseries(target_user uuid, days integer DEFAULT 90)
RETURNS TABLE(day date, total bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH series AS (
    SELECT generate_series(
      (current_date - (days - 1))::date,
      current_date::date,
      interval '1 day'
    )::date AS day
  )
  SELECT s.day, COALESCE(COUNT(r.id), 0)::bigint
  FROM series s
  LEFT JOIN recipes r ON date(r.created_at) = s.day AND r.user_id = target_user
  GROUP BY s.day
  ORDER BY s.day;
END;
$$;

-- 3) Top products for a user
CREATE OR REPLACE FUNCTION public.admin_user_top_products(target_user uuid, lim integer DEFAULT 5)
RETURNS TABLE(product_name text, reference text, times_prescribed bigint, thumbnail_url text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT elem->>'name', elem->>'reference', COUNT(*)::bigint, MAX(elem->>'thumbnail_url')
  FROM recipes, jsonb_array_elements(products) AS elem
  WHERE user_id = target_user
  GROUP BY elem->>'name', elem->>'reference'
  ORDER BY COUNT(*) DESC
  LIMIT lim;
END;
$$;

-- 4) Activity heatmap
CREATE OR REPLACE FUNCTION public.admin_user_activity_heatmap(target_user uuid)
RETURNS TABLE(weekday integer, hour integer, total bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT EXTRACT(ISODOW FROM created_at)::int,
         EXTRACT(HOUR FROM created_at)::int,
         COUNT(*)::bigint
  FROM recipes
  WHERE user_id = target_user AND created_at >= now() - interval '90 days'
  GROUP BY 1, 2
  ORDER BY 1, 2;
END;
$$;

-- 5) Send methods used by user
CREATE OR REPLACE FUNCTION public.admin_user_send_methods(target_user uuid)
RETURNS TABLE(method text, total bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT COALESCE(sent_via, 'sin_envio'), COUNT(*)::bigint
  FROM recipes
  WHERE user_id = target_user
  GROUP BY COALESCE(sent_via, 'sin_envio')
  ORDER BY 2 DESC;
END;
$$;

-- 6) Patients with stats for a user
CREATE OR REPLACE FUNCTION public.admin_user_patients_with_stats(target_user uuid)
RETURNS TABLE(
  id uuid,
  name text,
  phone text,
  email text,
  notes text,
  created_at timestamp with time zone,
  total_recipes bigint,
  last_recipe_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.name, p.phone, p.email, p.notes, p.created_at,
    COUNT(r.id)::bigint AS total_recipes,
    MAX(r.created_at) AS last_recipe_at
  FROM patients p
  LEFT JOIN recipes r ON r.patient_id = p.id
  WHERE p.user_id = target_user
  GROUP BY p.id
  ORDER BY MAX(r.created_at) DESC NULLS LAST, p.created_at DESC;
END;
$$;

-- Permissions
REVOKE ALL ON FUNCTION public.admin_user_overview(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_user_recipes_timeseries(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_user_top_products(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_user_activity_heatmap(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_user_send_methods(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_user_patients_with_stats(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_user_overview(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_user_recipes_timeseries(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_user_top_products(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_user_activity_heatmap(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_user_send_methods(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_user_patients_with_stats(uuid) TO authenticated;
