-- STEP 2 of 2 — Run AFTER roles-and-presence-step1-enums.sql succeeds.
-- Safe to re-run.
--
-- DB role values: admin (Founder), lead_web_designer (Lead Developer), customer
-- Display labels are mapped in src/lib/roles.ts

-- Migrate legacy client role to customer
UPDATE public.profiles SET role = 'customer' WHERE role = 'client';

-- Ensure founder account has admin role (adean2440@gmail.com)
UPDATE public.profiles
SET role = 'admin'
WHERE lower(trim(email)) = 'adean2440@gmail.com';

-- Live presence column (online / away / offline from heartbeat)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS profiles_last_seen_at_idx
  ON public.profiles (last_seen_at DESC);

-- Activity status column (manual labels: Available, In a meeting, etc.)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS activity_status TEXT DEFAULT 'Available';

UPDATE public.profiles
SET activity_status = 'Available'
WHERE activity_status IS NULL;

-- Update helper functions for staff / customer roles
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
      AND role IN ('admin', 'founder', 'lead_web_designer', 'lead_developer')
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
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('customer', 'client')
  );
$$;
