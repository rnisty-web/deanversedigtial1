-- Align storage file read access with email-matched portal clients.
-- Run after portal-client-projects.sql (requires get_my_client_id()).
-- Safe to re-run.

DROP POLICY IF EXISTS "Clients read own project files storage" ON storage.objects;

CREATE POLICY "Clients read own project files storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1
      FROM public.files f
      JOIN public.projects p ON p.id = f.project_id
      WHERE f.file_path = storage.objects.name
        AND p.client_id = public.get_my_client_id()
        AND public.get_my_client_id() IS NOT NULL
    )
  );
