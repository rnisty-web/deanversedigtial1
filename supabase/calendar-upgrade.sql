-- DeanVerse Digital calendar events
-- Safe to re-run in Supabase SQL Editor (paste ONLY this SQL)

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('meeting', 'call', 'deadline', 'internal')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  meeting_url TEXT,
  client_name TEXT,
  project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS calendar_events_starts_at_idx ON public.calendar_events (starts_at);
CREATE INDEX IF NOT EXISTS calendar_events_event_type_idx ON public.calendar_events (event_type);

DROP TRIGGER IF EXISTS calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access to calendar events" ON public.calendar_events;
CREATE POLICY "Admins full access to calendar events"
  ON public.calendar_events FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
