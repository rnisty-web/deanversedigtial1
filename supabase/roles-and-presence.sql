-- DeanVerse Digital — roles, presence & activity status upgrade
--
-- IMPORTANT: Run as TWO separate queries in Supabase SQL Editor.
-- PostgreSQL error 55P04 happens if you add enum values and use them
-- in the same transaction — so step 1 must finish before step 2.
--
-- 1) Run roles-and-presence-step1-enums.sql  (add enum values)
-- 2) Run roles-and-presence-step2.sql        (columns, data, functions)
--
-- Or paste each section below as its own "Run" in the SQL Editor.

-- ========== STEP 1 — run this block alone, wait for success ==========
-- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'lead_web_designer';
-- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'customer';
-- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'founder';
-- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'lead_developer';

-- ========== STEP 2 — run after step 1 succeeds (see step2 file) ==========
