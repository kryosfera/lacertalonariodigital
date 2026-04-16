
-- Admin can SELECT all recipes
CREATE POLICY "Admins can view all recipes"
ON public.recipes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can SELECT all patients
CREATE POLICY "Admins can view all patients"
ON public.patients
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Function: Top products from JSONB recipes.products
CREATE OR REPLACE FUNCTION public.admin_top_products(lim integer DEFAULT 10)
RETURNS TABLE(product_name text, reference text, times_prescribed bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    elem->>'name' AS product_name,
    elem->>'reference' AS reference,
    COUNT(*) AS times_prescribed
  FROM recipes, jsonb_array_elements(products) AS elem
  GROUP BY product_name, reference
  ORDER BY times_prescribed DESC
  LIMIT lim;
$$;

-- Function: Stats by province
CREATE OR REPLACE FUNCTION public.admin_province_stats()
RETURNS TABLE(province text, professionals bigint, total_recipes bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(p.province, 'Sin provincia') AS province,
    COUNT(DISTINCT p.user_id) AS professionals,
    COUNT(r.id) AS total_recipes
  FROM profiles p
  LEFT JOIN recipes r ON r.user_id = p.user_id
  GROUP BY p.province
  ORDER BY total_recipes DESC;
$$;

-- Function: Top professionals ranking
CREATE OR REPLACE FUNCTION public.admin_top_professionals(lim integer DEFAULT 10)
RETURNS TABLE(user_id uuid, clinic_name text, professional_name text, province text, locality text, total_recipes bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.clinic_name,
    p.professional_name,
    p.province,
    p.locality,
    COUNT(r.id) AS total_recipes
  FROM profiles p
  LEFT JOIN recipes r ON r.user_id = p.user_id
  GROUP BY p.user_id, p.clinic_name, p.professional_name, p.province, p.locality
  ORDER BY total_recipes DESC
  LIMIT lim;
$$;

-- Function: Recipes per month (last 6 months)
CREATE OR REPLACE FUNCTION public.admin_recipes_per_month()
RETURNS TABLE(month text, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
    COUNT(*) AS total
  FROM recipes
  WHERE created_at >= date_trunc('month', now()) - interval '5 months'
  GROUP BY date_trunc('month', created_at)
  ORDER BY date_trunc('month', created_at);
$$;
