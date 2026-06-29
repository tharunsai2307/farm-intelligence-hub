
CREATE POLICY "crop-obs: read own"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'crop-observations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "crop-obs: insert own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'crop-observations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "crop-obs: update own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'crop-observations' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'crop-observations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "crop-obs: delete own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'crop-observations' AND (storage.foldername(name))[1] = auth.uid()::text);
