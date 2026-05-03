-- Fix storage UPDATE policies missing WITH CHECK clause (required for upsert)
DROP POLICY IF EXISTS "Admins can update category images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update files in recomendaciones bucket" ON storage.objects;

CREATE POLICY "Admins can update category images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'category-images' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'category-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update files in recomendaciones bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'recomendaciones' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'recomendaciones' AND has_role(auth.uid(), 'admin'::app_role));