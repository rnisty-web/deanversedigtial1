-- Restrict portal file uploads to owned projects.
-- Run after portal-client-projects.sql (requires get_my_client_id()).
-- Safe to re-run.

DROP POLICY IF EXISTS "Clients upload own project files storage" ON storage.objects;

CREATE POLICY "Clients upload own project files storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.client_id = public.get_my_client_id()
        AND public.get_my_client_id() IS NOT NULL
        AND storage.objects.name LIKE p.id::text || '/%'
    )
  );
