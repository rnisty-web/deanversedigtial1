-- Allow anonymous read of public CMS settings (hero, services copy, etc.).
-- Admin write remains restricted by existing policies.
-- Run in Supabase SQL editor if the public site shows defaults despite admin saves
-- and SUPABASE_SERVICE_ROLE_KEY is not set on the server.

CREATE POLICY IF NOT EXISTS "Public read CMS settings"
  ON public.settings FOR SELECT
  USING (true);
