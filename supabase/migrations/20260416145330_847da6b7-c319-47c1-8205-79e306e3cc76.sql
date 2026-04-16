
DROP FUNCTION IF EXISTS public.admin_top_products(integer);

CREATE OR REPLACE FUNCTION public.admin_top_products(lim integer DEFAULT 10)
 RETURNS TABLE(product_name text, reference text, times_prescribed bigint, thumbnail_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    elem->>'name' AS product_name,
    elem->>'reference' AS reference,
    COUNT(*) AS times_prescribed,
    MAX(elem->>'thumbnail_url') AS thumbnail_url
  FROM recipes, jsonb_array_elements(products) AS elem
  GROUP BY product_name, reference
  ORDER BY times_prescribed DESC
  LIMIT lim;
$function$;
