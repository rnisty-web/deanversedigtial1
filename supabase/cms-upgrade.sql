-- DeanVerse Digital CMS upgrade
-- Safe to re-run in Supabase SQL Editor (paste ONLY this SQL)

ALTER TABLE public.portfolio
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS case_study JSONB DEFAULT '{}'::JSONB;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS budget TEXT,
  ADD COLUMN IF NOT EXISTS project_type TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read site media" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload site media" ON storage.objects;
DROP POLICY IF EXISTS "Admins update site media" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete site media" ON storage.objects;

CREATE POLICY "Public read site media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-media');

CREATE POLICY "Admins upload site media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-media' AND public.is_admin());

CREATE POLICY "Admins update site media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-media' AND public.is_admin());

CREATE POLICY "Admins delete site media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-media' AND public.is_admin());
