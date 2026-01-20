-- Add default value to code column using the existing function
ALTER TABLE public.short_urls 
ALTER COLUMN code SET DEFAULT generate_short_code();