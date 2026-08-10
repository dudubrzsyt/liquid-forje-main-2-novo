
CREATE POLICY "Community media readable by authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'community');

CREATE POLICY "Users upload own community media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'community' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own community media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'community' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own community media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'community' AND auth.uid()::text = (storage.foldername(name))[1]);
