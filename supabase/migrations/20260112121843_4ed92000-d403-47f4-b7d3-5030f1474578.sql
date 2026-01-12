-- Tabla de categorías con soporte para jerarquía
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de productos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  reference TEXT,
  ean TEXT,
  seo_title TEXT,
  seo_description TEXT,
  share_image_url TEXT,
  description_html TEXT,
  thumbnail_url TEXT,
  main_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  video_urls TEXT[] DEFAULT '{}',
  document_urls TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  prescription_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsquedas
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_reference ON public.products(reference);
CREATE INDEX idx_products_ean ON public.products(ean);
CREATE INDEX idx_products_active_visible ON public.products(is_active, is_visible);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- RLS para categorías (lectura pública)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

-- RLS para productos (lectura pública para productos activos y visibles)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active visible products are viewable by everyone"
ON public.products FOR SELECT
USING (is_active = true AND is_visible = true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();