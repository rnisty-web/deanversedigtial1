-- Portal file storage setup
-- Run in Supabase SQL Editor after creating the "project-files" bucket (Storage → New bucket)

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Note: Email-matched client file access requires portal-client-projects.sql
-- (get_my_client_id) and optionally storage-email-clients.sql — see MIGRATIONS.md.

DROP POLICY IF EXISTS "Admins manage project files storage" ON storage.objects;
DROP POLICY IF EXISTS "Clients read own project files storage" ON storage.objects;
DROP POLICY IF EXISTS "Clients upload own project files storage" ON storage.objects;

CREATE POLICY "Admins manage project files storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'project-files' AND public.is_admin())
  WITH CHECK (bucket_id = 'project-files' AND public.is_admin());

CREATE POLICY "Clients read own project files storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1
      FROM public.files f
      JOIN public.projects p ON p.id = f.project_id
      JOIN public.clients c ON c.id = p.client_id
      WHERE f.file_path = storage.objects.name
        AND c.profile_id = auth.uid()
    )
  );

CREATE POLICY "Clients upload own project files storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
  );
