-- Create table for short URLs
CREATE TABLE public.short_urls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '30 days')
);

-- Create index for fast code lookups
CREATE INDEX idx_short_urls_code ON public.short_urls(code);

-- Enable RLS
ALTER TABLE public.short_urls ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read short URLs (public access for pharmacy viewing)
CREATE POLICY "Anyone can view short URLs"
ON public.short_urls
FOR SELECT
USING (true);

-- Allow anyone to create short URLs (for basic users without auth)
CREATE POLICY "Anyone can create short URLs"
ON public.short_urls
FOR INSERT
WITH CHECK (true);

-- Function to generate short code
CREATE OR REPLACE FUNCTION public.generate_short_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
  chars text := 'abcdefghjkmnpqrstuvwxyz23456789';
BEGIN
  LOOP
    -- Generate 6 character code (no confusing chars like 0,O,1,l,I)
    new_code := '';
    FOR i IN 1..6 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM public.short_urls WHERE code = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Trigger to auto-generate code
CREATE OR REPLACE FUNCTION public.set_short_url_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_short_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_short_url_code
BEFORE INSERT ON public.short_urls
FOR EACH ROW
EXECUTE FUNCTION public.set_short_url_code();