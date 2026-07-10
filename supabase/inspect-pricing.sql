-- Inspect saved pricing content (run in Supabase SQL editor).
-- If tiers show your custom names here but /pricing shows Starter/Business/Custom,
-- redeploy after the CMS merge fix or open Site Content → Pricing → Save Section.

SELECT
  key,
  jsonb_typeof(value->'tiers') AS tiers_type,
  jsonb_array_length(value->'tiers') AS tier_count,
  value->'tiers' AS tiers,
  value->'faqs' AS faqs,
  updated_at
FROM public.settings
WHERE key = 'pricing';
