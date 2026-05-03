-- Anonymous analytics table for Quick Mode recipes
CREATE TABLE public.quick_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  sent_via TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quick_recipes ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can record a quick recipe
CREATE POLICY "Anyone can insert quick recipes"
ON public.quick_recipes
FOR INSERT
WITH CHECK (true);

-- Only admins can read the analytics
CREATE POLICY "Admins can view all quick recipes"
ON public.quick_recipes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_quick_recipes_created_at ON public.quick_recipes (created_at DESC);