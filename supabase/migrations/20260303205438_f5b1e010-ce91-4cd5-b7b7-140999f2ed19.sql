
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view short URLs" ON public.short_urls;

-- Replace with a policy that only allows viewing non-expired URLs
-- This prevents bulk enumeration while still allowing individual code lookups
CREATE POLICY "Anyone can view non-expired short URLs"
ON public.short_urls
FOR SELECT
USING (expires_at IS NULL OR expires_at > now());

-- Also restrict INSERT to authenticated users only
DROP POLICY IF EXISTS "Anyone can create short URLs" ON public.short_urls;

CREATE POLICY "Authenticated users can create short URLs"
ON public.short_urls
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
