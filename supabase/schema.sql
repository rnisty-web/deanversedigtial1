-- DeanVerse Digital — Supabase schema
-- Run in Supabase SQL Editor or via supabase db push

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums (safe to re-run)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'lead_web_designer', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM (
    'new', 'contacted', 'qualified', 'converted', 'lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM (
    'draft', 'planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.invoice_status AS ENUM (
    'draft', 'sent', 'paid', 'overdue', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.client_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Utility functions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles (must exist before is_admin / is_client helper functions)
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role public.user_role NOT NULL DEFAULT 'customer',
  company TEXT,
  phone TEXT,
  last_seen_at TIMESTAMPTZ,
  activity_status TEXT DEFAULT 'Available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_role_idx ON public.profiles (role);
CREATE INDEX profiles_email_idx ON public.profiles (email);
CREATE INDEX profiles_last_seen_at_idx ON public.profiles (last_seen_at DESC);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    'customer'
  );

  RETURN NEW;
END;
$$;

-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

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
      AND role IN ('admin', 'lead_web_designer')
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

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  notes TEXT,
  status public.client_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX clients_profile_id_idx ON public.clients (profile_id);
CREATE INDEX clients_email_idx ON public.clients (email);
CREATE INDEX clients_status_idx ON public.clients (status);

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'draft',
  budget NUMERIC(12, 2),
  deadline DATE,
  tech_stack JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX projects_client_id_idx ON public.projects (client_id);
CREATE INDEX projects_status_idx ON public.projects (status);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- portfolio
-- ---------------------------------------------------------------------------
CREATE TABLE public.portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  live_url TEXT,
  github_url TEXT,
  tags TEXT[] DEFAULT '{}',
  industry TEXT,
  case_study JSONB DEFAULT '{}'::JSONB,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX portfolio_published_idx ON public.portfolio (published);
CREATE INDEX portfolio_featured_idx ON public.portfolio (featured);
CREATE INDEX portfolio_sort_order_idx ON public.portfolio (sort_order);

CREATE TRIGGER portfolio_updated_at
  BEFORE UPDATE ON public.portfolio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_image TEXT,
  content TEXT NOT NULL,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX testimonials_published_idx ON public.testimonials (published);
CREATE INDEX testimonials_featured_idx ON public.testimonials (featured);

CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- blog_posts
-- ---------------------------------------------------------------------------
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  author_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX blog_posts_published_idx ON public.blog_posts (published);
CREATE INDEX blog_posts_author_id_idx ON public.blog_posts (author_id);
CREATE INDEX blog_posts_published_at_idx ON public.blog_posts (published_at DESC);

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT,
  service_interest TEXT,
  status public.lead_status NOT NULL DEFAULT 'new',
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX leads_status_idx ON public.leads (status);
CREATE INDEX leads_email_idx ON public.leads (email);
CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_project_id_idx ON public.messages (project_id);
CREATE INDEX messages_sender_id_idx ON public.messages (sender_id);
CREATE INDEX messages_recipient_id_idx ON public.messages (recipient_id);
CREATE INDEX messages_read_idx ON public.messages (read);

CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- files
-- ---------------------------------------------------------------------------
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX files_project_id_idx ON public.files (project_id);
CREATE INDEX files_uploaded_by_idx ON public.files (uploaded_by);

CREATE TRIGGER files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  line_items JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX invoices_client_id_idx ON public.invoices (client_id);
CREATE INDEX invoices_project_id_idx ON public.invoices (project_id);
CREATE INDEX invoices_status_idx ON public.invoices (status);

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- analytics
-- ---------------------------------------------------------------------------
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  page_path TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX analytics_event_type_idx ON public.analytics (event_type);
CREATE INDEX analytics_page_path_idx ON public.analytics (page_path);
CREATE INDEX analytics_created_at_idx ON public.analytics (created_at DESC);
CREATE INDEX analytics_user_id_idx ON public.analytics (user_id);

-- ---------------------------------------------------------------------------
-- settings
-- ---------------------------------------------------------------------------
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default site settings
INSERT INTO public.settings (key, value)
VALUES (
  'site',
  '{
    "name": "DeanVerse Digital",
    "tagline": "Freelance web design by Andrey",
    "email": "adean2440@gmail.com",
    "phone": "(619) 559-1008",
    "location": "California, USA"
  }'::JSONB
)
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Helper: client owns project via profile link
-- ---------------------------------------------------------------------------
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
    INNER JOIN public.clients c ON c.id = p.client_id
    WHERE p.id = project_uuid
      AND c.profile_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Profiles are viewable by owner"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles are updatable by owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = id);

-- clients
CREATE POLICY "Admins full access to clients"
  ON public.clients FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view own client record"
  ON public.clients FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Clients can update own client record"
  ON public.clients FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- projects
CREATE POLICY "Admins full access to projects"
  ON public.projects FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view own projects"
  ON public.projects FOR SELECT
  USING (public.client_owns_project(id));

-- portfolio (public read for published, admin write)
CREATE POLICY "Anyone can view published portfolio items"
  ON public.portfolio FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage portfolio"
  ON public.portfolio FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins update portfolio"
  ON public.portfolio FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete portfolio"
  ON public.portfolio FOR DELETE
  USING (public.is_admin());

-- testimonials (public read for published, admin write)
CREATE POLICY "Anyone can view published testimonials"
  ON public.testimonials FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage testimonials"
  ON public.testimonials FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- blog_posts (public read for published, admin write)
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage blog posts"
  ON public.blog_posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- leads (public insert for contact form, admin manage)
CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins full access to leads"
  ON public.leads FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins update leads"
  ON public.leads FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete leads"
  ON public.leads FOR DELETE
  USING (public.is_admin());

-- messages
CREATE POLICY "Admins full access to messages"
  ON public.messages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can mark messages read"
  ON public.messages FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- files
CREATE POLICY "Admins full access to files"
  ON public.files FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view files on own projects"
  ON public.files FOR SELECT
  USING (public.client_owns_project(project_id));

CREATE POLICY "Clients can upload files to own projects"
  ON public.files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND public.client_owns_project(project_id)
  );

-- invoices
CREATE POLICY "Admins full access to invoices"
  ON public.invoices FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view own invoices"
  ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = client_id
        AND c.profile_id = auth.uid()
    )
  );

-- analytics (public insert for page views, admin read)
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can read analytics"
  ON public.analytics FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can delete analytics"
  ON public.analytics FOR DELETE
  USING (public.is_admin());

-- settings (admin only)
CREATE POLICY "Admins full access to settings"
  ON public.settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket policies (run after creating 'project-files' bucket in UI)
-- ---------------------------------------------------------------------------
-- CREATE POLICY "Admins can manage all files in storage"
--   ON storage.objects FOR ALL
--   USING (bucket_id = 'project-files' AND public.is_admin())
--   WITH CHECK (bucket_id = 'project-files' AND public.is_admin());

-- CREATE POLICY "Clients can read own project files"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Grant usage to authenticated and anon roles
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
