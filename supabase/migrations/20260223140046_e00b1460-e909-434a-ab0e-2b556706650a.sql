-- Allow public SELECT on profiles (clinic data is commercial/public info)
CREATE POLICY "Public can view profiles"
ON public.profiles
FOR SELECT
USING (true);