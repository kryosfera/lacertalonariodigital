-- Create patients table
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS: Users can manage their own patients
CREATE POLICY "Users can manage their own patients"
  ON public.patients FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on patients
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create recipes table
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  sent_via text CHECK (sent_via IN ('whatsapp', 'email', 'both', 'pdf', 'print')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- RLS: Users can manage their own recipes
CREATE POLICY "Users can manage their own recipes"
  ON public.recipes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  clinic_name text,
  clinic_address text,
  professional_name text,
  registration_number text,
  signature_url text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Users can manage their own profile
CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create recipe_templates table
CREATE TABLE public.recipe_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on recipe_templates
ALTER TABLE public.recipe_templates ENABLE ROW LEVEL SECURITY;

-- RLS: Users can manage their own templates
CREATE POLICY "Users can manage their own templates"
  ON public.recipe_templates FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);