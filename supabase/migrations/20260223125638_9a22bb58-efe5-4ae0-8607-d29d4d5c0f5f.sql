
-- Allow authenticated users to upload their own profile files
CREATE POLICY "Users can upload profile files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'recomendaciones'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'profiles'
);

-- Allow authenticated users to update their own profile files
CREATE POLICY "Users can update profile files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'recomendaciones'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'profiles'
);

-- Allow public read access to profile files (logos/signatures shown in recipes)
CREATE POLICY "Profile files are publicly accessible"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'recomendaciones'
  AND (storage.foldername(name))[1] = 'profiles'
);
