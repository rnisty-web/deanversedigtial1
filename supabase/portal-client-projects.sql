-- Run in Supabase SQL editor.
-- Links portal users to client records from contact-form leads (same email)
-- and optionally ties projects back to the original lead.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS projects_lead_id_idx ON public.projects (lead_id);

CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id
  FROM public.clients c
  INNER JOIN public.profiles p ON p.id = auth.uid()
  WHERE c.profile_id = auth.uid()
     OR (
       c.profile_id IS NULL
       AND lower(trim(c.email)) = lower(trim(p.email))
     )
  ORDER BY CASE WHEN c.profile_id = auth.uid() THEN 0 ELSE 1 END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.client_owns_project(project_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = project_uuid
      AND p.client_id = public.get_my_client_id()
      AND public.get_my_client_id() IS NOT NULL
  );
$$;

DROP POLICY IF EXISTS "Clients can view own client record" ON public.clients;

CREATE POLICY "Clients can view own client record"
  ON public.clients FOR SELECT
  USING (
    profile_id = auth.uid()
    OR (
      profile_id IS NULL
      AND lower(trim(email)) = (
        SELECT lower(trim(email))
        FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Clients can link profile by matching email"
  ON public.clients FOR UPDATE
  USING (
    profile_id IS NULL
    AND lower(trim(email)) = (
      SELECT lower(trim(email))
      FROM public.profiles
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (profile_id = auth.uid());
