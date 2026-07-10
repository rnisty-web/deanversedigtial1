-- Run after protect-profile-roles.sql
-- Adds optional per-user admin portal permission overrides.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT NULL;

COMMENT ON COLUMN public.profiles.admin_permissions IS
  'Optional per-user admin portal permission override. NULL inherits permissions from assigned roles.';
