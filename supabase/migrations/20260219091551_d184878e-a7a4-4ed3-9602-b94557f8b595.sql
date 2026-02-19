
-- ================================================
-- FASE 1: Correcciones críticas de rendimiento
-- ================================================

-- 1.1 Vista optimizada para patients (elimina N+1 queries)
CREATE OR REPLACE VIEW public.patients_with_stats AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.phone,
  p.email,
  p.notes,
  p.created_at,
  p.updated_at,
  COUNT(r.id)::integer AS recipe_count,
  MAX(r.created_at) AS last_recipe_date
FROM public.patients p
LEFT JOIN public.recipes r ON r.patient_id = p.id
GROUP BY p.id, p.user_id, p.name, p.phone, p.email, p.notes, p.created_at, p.updated_at;

-- 1.2 Índices en short_urls para acelerar búsquedas y limpieza de expirados
CREATE INDEX IF NOT EXISTS idx_short_urls_code ON public.short_urls(code);
CREATE INDEX IF NOT EXISTS idx_short_urls_expires_at ON public.short_urls(expires_at);

-- 1.3 Función de limpieza de short_urls expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_short_urls()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.short_urls
  WHERE expires_at IS NOT NULL AND expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 1.4 Índice en recipes.patient_id para acelerar los JOINs de la vista
CREATE INDEX IF NOT EXISTS idx_recipes_patient_id ON public.recipes(patient_id);

-- 1.5 Índice en recipes.user_id para acelerar consultas del historial
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);

-- 1.6 Índice en recipes.created_at para acelerar ordenación del historial
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);
