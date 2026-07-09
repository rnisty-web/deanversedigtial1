-- Auto-provision portal clients + fix invoice/lead RLS for self-serve users.
-- Run in Supabase SQL Editor after portal-client-projects.sql.

-- 1) Auto-create/link client row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name TEXT;
  existing_client_id UUID;
BEGIN
  display_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''),
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, display_name, 'customer')
  ON CONFLICT (id) DO NOTHING;

  SELECT c.id INTO existing_client_id
  FROM public.clients c
  WHERE lower(trim(c.email)) = lower(trim(NEW.email))
  ORDER BY c.created_at ASC
  LIMIT 1;

  IF existing_client_id IS NOT NULL THEN
    UPDATE public.clients
    SET profile_id = NEW.id
    WHERE id = existing_client_id
      AND profile_id IS NULL;
  ELSE
    INSERT INTO public.clients (profile_id, name, email, status)
    VALUES (NEW.id, display_name, NEW.email, 'active');
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Invoices: allow email-matched clients (requires get_my_client_id from portal-client-projects.sql)
DROP POLICY IF EXISTS "Clients can view own invoices" ON public.invoices;

CREATE POLICY "Clients can view own invoices"
  ON public.invoices FOR SELECT
  USING (
    client_id = public.get_my_client_id()
    AND public.get_my_client_id() IS NOT NULL
  );

-- 3) Leads: portal users can see their own inquiry status
DROP POLICY IF EXISTS "Users can view own leads by email" ON public.leads;

CREATE POLICY "Users can view own leads by email"
  ON public.leads FOR SELECT
  USING (
    lower(trim(email)) = (
      SELECT lower(trim(p.email))
      FROM public.profiles p
      WHERE p.id = auth.uid()
    )
  );
