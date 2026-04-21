-- Recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  kind TEXT NOT NULL DEFAULT 'pdf',
  pdf_url TEXT,
  image_url TEXT,
  vimeo_id TEXT,
  vimeo_hash TEXT,
  vimeo_url TEXT,
  external_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recommendations_kind_check CHECK (kind IN ('pdf', 'video', 'link'))
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible recommendations viewable by everyone"
  ON public.recommendations FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Admins can manage all recommendations"
  ON public.recommendations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_recommendations_updated_at
  BEFORE UPDATE ON public.recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_recommendations_visible_sort ON public.recommendations(is_visible, sort_order);

-- Storage policies for the existing 'recomendaciones' bucket so admins can manage files
CREATE POLICY "Admins can upload to recomendaciones bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recomendaciones' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update files in recomendaciones bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'recomendaciones' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete files in recomendaciones bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recomendaciones' AND has_role(auth.uid(), 'admin'::app_role));

-- Seed with existing 4 hardcoded recommendations
INSERT INTO public.recommendations (slug, title, description, icon, kind, pdf_url, image_url, vimeo_id, vimeo_hash, vimeo_url, sort_order, is_visible) VALUES
  ('cirugia-oral-general', 'Cirugía Oral General', 'Recomendaciones generales tras una cirugía oral', 'Scissors', 'pdf',
   'https://wvqqoigrslatxnbykcji.supabase.co/storage/v1/object/public/recomendaciones/docs/Cirugia_Oral_General.pdf',
   'https://www.lacertalonariodigital.com/archivos/recomendacion-cirujia-p.jpg',
   NULL, NULL, NULL, 10, true),
  ('extracciones-dentales', 'Extracciones Dentales', 'Cuidados posteriores a una extracción dental', 'FileText', 'pdf',
   'https://wvqqoigrslatxnbykcji.supabase.co/storage/v1/object/public/recomendaciones/docs/Extracciones.pdf',
   'https://www.lacertalonariodigital.com/archivos/recomendacion-extraccion-p.jpg',
   NULL, NULL, NULL, 20, true),
  ('injerto-encias', 'Injerto de Encías', 'Recomendaciones tras un injerto de encías', 'Syringe', 'pdf',
   'https://wvqqoigrslatxnbykcji.supabase.co/storage/v1/object/public/recomendaciones/docs/Injerto_Encias.pdf',
   'https://www.lacertalonariodigital.com/archivos/recomendacion-injerto-p.jpg',
   NULL, NULL, NULL, 30, true),
  ('video-recomendacion', 'Video Recomendaciones', 'Vídeo explicativo con las recomendaciones post-cirugía', 'Play', 'video',
   NULL,
   'https://www.lacertalonariodigital.com/archivos/video_600x600.png',
   '943145092', '757334f829', 'https://vimeo.com/943145092', 40, true)
ON CONFLICT (slug) DO NOTHING;