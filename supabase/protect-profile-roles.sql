-- Prevent non-admins from escalating privileges via profiles self-update.
-- Run after schema.sql and multi-roles.sql. Safe to re-run.

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
