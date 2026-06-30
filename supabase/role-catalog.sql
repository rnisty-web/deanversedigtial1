-- Role catalog support: dynamic enum values + staff checks from settings.roleCatalog
-- Run in Supabase SQL Editor after existing migrations.

CREATE OR REPLACE FUNCTION public.add_user_role_enum_value(new_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new_value IS NULL OR new_value !~ '^[a-z][a-z0-9_]*$' THEN
    RAISE EXCEPTION 'Invalid role slug';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role'
      AND e.enumlabel = new_value
  ) THEN
    EXECUTE format('ALTER TYPE public.user_role ADD VALUE %L', new_value);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.add_user_role_enum_value(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_user_role_enum_value(text) TO service_role;

-- Seed default role catalog in settings (labels + colors for admin UI)
INSERT INTO public.settings (key, value)
VALUES (
  'roleCatalog',
  '[
    {"slug":"admin","label":"Founder","color":"#fb7185","isStaff":true,"isSystem":true,"founderOnly":true,"sortOrder":0},
    {"slug":"lead_developer","label":"Lead Developer","color":"#22d3ee","isStaff":true,"isSystem":true,"sortOrder":10},
    {"slug":"lead_web_designer","label":"Lead Web Designer","color":"#a78bfa","isStaff":true,"isSystem":true,"sortOrder":20},
    {"slug":"customer","label":"Customer","color":"#fbbf24","isStaff":false,"isSystem":true,"sortOrder":30}
  ]'::JSONB
)
ON CONFLICT (key) DO NOTHING;

-- Staff helper: built-in staff roles + custom roles flagged isStaff in roleCatalog
CREATE OR REPLACE FUNCTION public.is_staff_profile(profile_roles public.user_role[], profile_role public.user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM unnest(COALESCE(profile_roles, ARRAY[profile_role])) AS role_slug
    WHERE role_slug::text IN ('admin', 'founder', 'lead_web_designer', 'lead_developer')
       OR EXISTS (
         SELECT 1
         FROM public.settings s,
              LATERAL jsonb_array_elements(s.value) AS item
         WHERE s.key = 'roleCatalog'
           AND item->>'slug' = role_slug::text
           AND COALESCE((item->>'archived')::boolean, false) = false
           AND COALESCE((item->>'isStaff')::boolean, false) = true
       )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_staff_profile(
    (SELECT roles FROM public.profiles WHERE id = auth.uid()),
    (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
$$;
