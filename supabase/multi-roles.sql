-- Multi-role support for profiles
-- Run in Supabase SQL Editor after roles-and-presence-step1/2 migrations.
-- Safe to re-run.

-- Array column for multiple roles per user
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS roles public.user_role[] DEFAULT NULL;

-- Backfill from legacy single role column
UPDATE public.profiles
SET roles = ARRAY[role]
WHERE roles IS NULL OR cardinality(roles) = 0;

-- Ensure founder account has admin in roles array
UPDATE public.profiles
SET roles = ARRAY(SELECT DISTINCT unnest(COALESCE(roles, ARRAY[]::public.user_role[]) || ARRAY['admin'::public.user_role]))
WHERE lower(trim(email)) = 'adean2440@gmail.com';

-- Keep legacy role column in sync (highest-priority role for backward compatibility)
CREATE OR REPLACE FUNCTION public.sync_profile_primary_role()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  primary_role public.user_role;
BEGIN
  IF NEW.roles IS NULL OR cardinality(NEW.roles) = 0 THEN
    NEW.roles := ARRAY[COALESCE(NEW.role, 'customer'::public.user_role)];
  END IF;

  SELECT r INTO primary_role
  FROM unnest(NEW.roles) AS r
  ORDER BY CASE r
    WHEN 'admin' THEN 1
    WHEN 'founder' THEN 1
    WHEN 'lead_developer' THEN 2
    WHEN 'lead_web_designer' THEN 3
    WHEN 'customer' THEN 4
    WHEN 'client' THEN 4
    ELSE 5
  END
  LIMIT 1;

  NEW.role := COALESCE(primary_role, 'customer'::public.user_role);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_primary_role ON public.profiles;
CREATE TRIGGER profiles_sync_primary_role
  BEFORE INSERT OR UPDATE OF roles, role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_primary_role();

-- Re-sync all rows so role matches roles[]
UPDATE public.profiles SET roles = roles;

CREATE INDEX IF NOT EXISTS profiles_roles_gin_idx
  ON public.profiles USING GIN (roles);

-- Update RLS helper functions to check roles array (with legacy role fallback)
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
      AND (
        role IN ('admin', 'founder', 'lead_web_designer', 'lead_developer')
        OR roles && ARRAY['admin', 'founder', 'lead_web_designer', 'lead_developer']::public.user_role[]
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_client()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role IN ('customer', 'client')
        OR p.roles && ARRAY['customer', 'client']::public.user_role[]
      )
      AND NOT (
        p.role IN ('admin', 'founder', 'lead_web_designer', 'lead_developer')
        OR p.roles && ARRAY['admin', 'founder', 'lead_web_designer', 'lead_developer']::public.user_role[]
      )
  );
$$;
