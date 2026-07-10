-- Run after user-permissions-upgrade.sql
-- Adds optional per-user client portal permission overrides.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS client_permissions TEXT[] DEFAULT NULL;

COMMENT ON COLUMN public.profiles.client_permissions IS
  'Optional per-user client portal permission override. NULL inherits permissions from assigned roles.';
