-- PhishLens AI Supabase Database Setup
-- Copy and paste these SQL commands into your Supabase SQL Editor
-- Go to: https://supabase.com -> Your Project -> SQL Editor -> New Query

-- ============================================================
-- 1. Create profiles table (linked to auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Create email_analysis table (stores user email scans)
-- ============================================================

CREATE TABLE public.email_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  risk_score integer NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  level text NOT NULL CHECK (level IN ('low', 'medium', 'high')),
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.email_analysis ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Create indexes for better query performance
-- ============================================================

CREATE INDEX email_analysis_user_id_idx ON public.email_analysis(user_id);
CREATE INDEX email_analysis_created_at_idx ON public.email_analysis(created_at DESC);

-- ============================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================

-- Profiles table: Users can only see their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Email analysis table: Users can only see/insert their own analyses
CREATE POLICY "Users can view their own email analyses"
  ON public.email_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert email analyses"
  ON public.email_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. Trigger to auto-create profile on signup (OPTIONAL)
-- ============================================================

-- This trigger automatically creates a profile when a new user signs up.
-- It's optional but recommended for better UX.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 6. Enable Realtime for email_analysis table (OPTIONAL)
-- ============================================================

-- Go to Supabase Dashboard -> Replication -> Enable "email_analysis" table
-- Or uncomment and run this command (if replication is set up):
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.email_analysis;

-- ============================================================
-- IMPORTANT: After running these SQL commands:
-- ============================================================
-- 1. Get your Supabase URL and Anon Key from:
--    Dashboard -> Settings -> API -> Project URL & anon key
-- 2. Create a .env.local file in your project root
-- 3. Add:
--    VITE_SUPABASE_URL=<your-url>
--    VITE_SUPABASE_ANON_KEY=<your-anon-key>
-- 4. Run: npm run dev
-- ============================================================
