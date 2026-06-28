-- STEP 1 of 2 — Run this FIRST in Supabase SQL Editor, then run step 2.
-- PostgreSQL requires new enum values to be committed before they can be used.
--
-- After this succeeds, run: roles-and-presence-step2.sql

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'lead_web_designer';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'customer';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'founder';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'lead_developer';
