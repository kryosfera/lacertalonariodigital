
ALTER TABLE public.recipes ADD COLUMN dispensed_at timestamptz DEFAULT NULL;
ALTER TABLE public.recipes ADD COLUMN dispensed_by text DEFAULT NULL;

-- Allow anyone to mark public recipes as dispensed
CREATE POLICY "Anyone can mark recipes as dispensed"
ON public.recipes FOR UPDATE
USING (recipe_code IS NOT NULL)
WITH CHECK (recipe_code IS NOT NULL);
