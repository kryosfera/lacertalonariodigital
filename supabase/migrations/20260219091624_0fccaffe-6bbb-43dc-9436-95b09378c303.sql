
-- Recrear la vista con SECURITY INVOKER para que respete la RLS del usuario autenticado
-- Esto asegura que cada dentista solo vea SUS propios pacientes
DROP VIEW IF EXISTS public.patients_with_stats;

CREATE OR REPLACE VIEW public.patients_with_stats
WITH (security_invoker = true)
AS
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
