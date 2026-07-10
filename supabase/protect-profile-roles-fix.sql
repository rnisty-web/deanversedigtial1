-- Run after protect-profile-roles.sql
-- Allows service-role admin API updates and Supabase SQL Editor migrations.

CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF (
      (OLD.role IS DISTINCT FROM NEW.role OR OLD.roles IS DISTINCT FROM NEW.roles)
      AND COALESCE(auth.jwt() ->> 'role', '') <> 'service_role'
      AND current_user NOT IN ('postgres', 'supabase_admin')
      AND NOT public.is_admin()
      AND NOT public.is_staff()
    ) THEN
      RAISE EXCEPTION 'Only administrators can change profile roles';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_roles_trigger ON public.profiles;

CREATE TRIGGER protect_profile_roles_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_roles();
