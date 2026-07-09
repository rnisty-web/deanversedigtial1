-- Allow anonymous read of public CMS settings (hero, services copy, etc.).
-- Admin write remains restricted by existing policies.
-- Run in Supabase SQL editor if the public site shows defaults despite admin saves
-- and SUPABASE_SERVICE_ROLE_KEY is not set on the server.
-- Safe to re-run.

DROP POLICY IF EXISTS "Public read CMS settings" ON public.settings;

CREATE POLICY "Public read CMS settings"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (true);
