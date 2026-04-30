DROP POLICY IF EXISTS "Authenticated users can create short URLs" ON public.short_urls;

CREATE POLICY "Anyone can create short URLs"
  ON public.short_urls FOR INSERT
  WITH CHECK (true);