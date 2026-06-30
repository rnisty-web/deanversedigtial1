-- Seed default dashboard theme (Gold & Emerald)
INSERT INTO public.settings (key, value)
VALUES ('dashboardTheme', '"classic"'::JSONB)
ON CONFLICT (key) DO NOTHING;
