-- Restrict public reads on settings to CMS content keys only.
-- Admin-only keys (roleCatalog, dashboardTheme, etc.) stay protected.
-- Safe to re-run.

DROP POLICY IF EXISTS "Public read CMS settings" ON public.settings;

CREATE POLICY "Public read CMS settings"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (
    key IN (
      'site',
      'hero',
      'stats',
      'process',
      'processIntro',
      'hireMePage',
      'about',
      'services',
      'servicesPage',
      'pricing',
      'contact',
      'portfolioPage',
      'testimonialsPage',
      'cta',
      'techStack',
      'experience',
      'education',
      'faq',
      'cmsLayout'
    )
  );
