CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, clinic_name, locality, province)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data->>'clinic_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'locality', ''),
    NULLIF(NEW.raw_user_meta_data->>'province', '')
  )
  ON CONFLICT (user_id) DO UPDATE
    SET clinic_name = COALESCE(EXCLUDED.clinic_name, public.profiles.clinic_name),
        locality    = COALESCE(EXCLUDED.locality,    public.profiles.locality),
        province    = COALESCE(EXCLUDED.province,    public.profiles.province);
  RETURN NEW;
END;
$$;