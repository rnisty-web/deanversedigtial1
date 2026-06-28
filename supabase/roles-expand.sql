-- Run in Supabase SQL editor if role assignment fails for lead_developer.
-- Step 1: add enum values (safe to re-run; ignore "already exists" errors)
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'lead_developer';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'founder';

-- Step 2: update staff helper to recognize all staff roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'founder', 'lead_developer', 'lead_web_designer')
  );
$$;
