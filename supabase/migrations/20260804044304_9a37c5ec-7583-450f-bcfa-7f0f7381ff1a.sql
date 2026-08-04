-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'student',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- SHARED updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  course_code text,
  group_code text,
  subjects text[] NOT NULL DEFAULT '{}',
  goals text[] NOT NULL DEFAULT '{}',
  study_hours text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUTO PROFILE + ROLE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'phone'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student') ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SYLLABUS CATALOG
CREATE TABLE public.ca_courses (
  code text PRIMARY KEY,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ca_courses TO anon, authenticated;
GRANT ALL ON public.ca_courses TO service_role;
ALTER TABLE public.ca_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are publicly readable" ON public.ca_courses FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER update_ca_courses_updated_at BEFORE UPDATE ON public.ca_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ca_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL REFERENCES public.ca_courses(code) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_code, code)
);
GRANT SELECT ON public.ca_groups TO anon, authenticated;
GRANT ALL ON public.ca_groups TO service_role;
ALTER TABLE public.ca_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups are publicly readable" ON public.ca_groups FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER update_ca_groups_updated_at BEFORE UPDATE ON public.ca_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ca_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL REFERENCES public.ca_courses(code) ON DELETE CASCADE,
  group_code text NOT NULL,
  name text NOT NULL,
  short_name text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_code, group_code, name)
);
GRANT SELECT ON public.ca_subjects TO anon, authenticated;
GRANT ALL ON public.ca_subjects TO service_role;
ALTER TABLE public.ca_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects are publicly readable" ON public.ca_subjects FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER update_ca_subjects_updated_at BEFORE UPDATE ON public.ca_subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.ca_courses (code, name, description, sort_order) VALUES
  ('foundation', 'CA Foundation', 'Entry level of the CA course', 1),
  ('intermediate', 'CA Intermediate', 'Second level of the CA course', 2),
  ('final', 'CA Final', 'Final level of the CA course', 3);

INSERT INTO public.ca_groups (course_code, code, name, description, sort_order) VALUES
  ('foundation', 'none', 'No Group', 'Foundation has a single set of papers', 1),
  ('intermediate', 'both', 'Both Groups', 'Prepare for Group 1 and Group 2', 1),
  ('intermediate', 'group1', 'Group 1', 'Papers 1 to 3', 2),
  ('intermediate', 'group2', 'Group 2', 'Papers 4 to 6', 3),
  ('final', 'both', 'Both Groups', 'Prepare for Group 1 and Group 2', 1),
  ('final', 'group1', 'Group 1', 'Papers 1 to 3', 2),
  ('final', 'group2', 'Group 2', 'Papers 4 to 6', 3);

INSERT INTO public.ca_subjects (course_code, group_code, name, short_name, sort_order) VALUES
  ('foundation', 'none', 'Accounting', 'Accounting', 1),
  ('foundation', 'none', 'Business Laws', 'Laws', 2),
  ('foundation', 'none', 'Quantitative Aptitude', 'Maths', 3),
  ('foundation', 'none', 'Business Economics', 'Economics', 4),
  ('intermediate', 'group1', 'Advanced Accounting', 'Adv. Accounting', 1),
  ('intermediate', 'group1', 'Corporate and Other Laws', 'Corporate Laws', 2),
  ('intermediate', 'group1', 'Taxation', 'Taxation', 3),
  ('intermediate', 'group2', 'Cost and Management Accounting', 'Costing', 1),
  ('intermediate', 'group2', 'Auditing and Ethics', 'Audit', 2),
  ('intermediate', 'group2', 'Financial Management and Strategic Management', 'FM & SM', 3),
  ('final', 'group1', 'Financial Reporting', 'FR', 1),
  ('final', 'group1', 'Advanced Financial Management', 'AFM', 2),
  ('final', 'group1', 'Advanced Auditing, Assurance and Professional Ethics', 'Advanced Audit', 3),
  ('final', 'group2', 'Direct Tax Laws and International Taxation', 'Direct Tax', 1),
  ('final', 'group2', 'Indirect Tax Laws', 'Indirect Tax', 2),
  ('final', 'group2', 'Integrated Business Solutions', 'IBS', 3);