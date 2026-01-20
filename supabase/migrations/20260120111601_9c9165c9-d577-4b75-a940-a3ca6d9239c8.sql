-- Add recipe_code column to recipes table for shareable URLs
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS recipe_code text UNIQUE;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_recipes_recipe_code ON public.recipes(recipe_code);

-- Create function to generate unique recipe code
CREATE OR REPLACE FUNCTION public.generate_recipe_code()
RETURNS text AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate code: YYMMDDHHMMSS + 3 random chars (like the reference site)
    new_code := to_char(now(), 'YYMMDDHH24MISS') || 
                chr(floor(random() * 26 + 97)::int) ||
                chr(floor(random() * 26 + 97)::int) ||
                chr(floor(random() * 26 + 97)::int);
    
    SELECT EXISTS(SELECT 1 FROM public.recipes WHERE recipe_code = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-generate recipe code on insert
CREATE OR REPLACE FUNCTION public.set_recipe_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recipe_code IS NULL THEN
    NEW.recipe_code := generate_recipe_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_set_recipe_code ON public.recipes;
CREATE TRIGGER trigger_set_recipe_code
  BEFORE INSERT ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_recipe_code();

-- Allow public read access to recipes by code (for sharing)
CREATE POLICY "Anyone can view recipes by code"
  ON public.recipes FOR SELECT
  USING (recipe_code IS NOT NULL);