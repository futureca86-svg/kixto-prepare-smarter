-- 1. super_admin role value (no literal use in this transaction)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text = 'super_admin')
$$;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

-- 2. SUPPORT CENTER
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  subject text NOT NULL,
  body text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'issue',
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pending',
  assigned_to uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tickets read" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own tickets insert" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "super admin tickets" ON public.support_tickets FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.support_ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid,
  body text NOT NULL,
  is_staff boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_ticket_replies TO authenticated;
GRANT ALL ON public.support_ticket_replies TO service_role;
ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own replies read" ON public.support_ticket_replies FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "own replies insert" ON public.support_ticket_replies FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "super admin replies" ON public.support_ticket_replies FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- 3. BILLING
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  current_period_start date,
  current_period_end date,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "super admin subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'succeeded',
  provider text NOT NULL DEFAULT 'manual',
  provider_ref text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "super admin payments" ON public.payments FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- 4. AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  ip text,
  device text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admin audit read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "authenticated audit insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- 5. FEATURE FLAGS
CREATE TABLE public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  enabled boolean NOT NULL DEFAULT true,
  rollout integer NOT NULL DEFAULT 100,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feature_flags TO authenticated, anon;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flags readable" ON public.feature_flags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "super admin flags" ON public.feature_flags FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
GRANT UPDATE, INSERT, DELETE ON public.feature_flags TO authenticated;

INSERT INTO public.feature_flags (key, label, description) VALUES
  ('memory-guard','Memory Guard','Spaced-repetition revision module'),
  ('practice-papers','Practice Papers','Paper generation and attempts'),
  ('planner','Planner','Daily study planner'),
  ('analytics','Analytics','Student analytics dashboards'),
  ('reports','Reports','Downloadable performance reports'),
  ('notifications','Notifications','In-app and email reminders'),
  ('support-center','Support Center','Student ticketing'),
  ('beta-features','Beta Features','Experimental features for testers');

-- 6. BACKGROUND JOBS
CREATE TABLE public.background_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'system',
  status text NOT NULL DEFAULT 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  duration_ms integer,
  error text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.background_jobs TO authenticated;
GRANT ALL ON public.background_jobs TO service_role;
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admin jobs" ON public.background_jobs FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER background_jobs_updated_at BEFORE UPDATE ON public.background_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. EMAIL LOGS
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  template text NOT NULL DEFAULT 'announcement',
  subject text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  error text,
  provider_ref text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admin emails" ON public.email_logs FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER email_logs_updated_at BEFORE UPDATE ON public.email_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. SECURITY EVENTS
CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  kind text NOT NULL DEFAULT 'failed_login',
  severity text NOT NULL DEFAULT 'info',
  ip text,
  device text,
  browser text,
  blocked boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.security_events TO authenticated;
GRANT INSERT ON public.security_events TO anon;
GRANT ALL ON public.security_events TO service_role;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admin security read" ON public.security_events FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "anyone can report security event" ON public.security_events FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 9. QUESTION BANK
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text,
  subject text,
  chapter text,
  topic text,
  difficulty text NOT NULL DEFAULT 'medium',
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  answer text,
  explanation text,
  marks integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'published',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published questions readable" ON public.questions FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "super admin questions" ON public.questions FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. SYLLABUS DEPTH
CREATE TABLE public.ca_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.ca_subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ca_chapters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ca_chapters TO authenticated;
GRANT ALL ON public.ca_chapters TO service_role;
ALTER TABLE public.ca_chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chapters readable" ON public.ca_chapters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "super admin chapters" ON public.ca_chapters FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER ca_chapters_updated_at BEFORE UPDATE ON public.ca_chapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ca_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.ca_chapters(id) ON DELETE CASCADE,
  name text NOT NULL,
  learning_outcome text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ca_topics TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ca_topics TO authenticated;
GRANT ALL ON public.ca_topics TO service_role;
ALTER TABLE public.ca_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics readable" ON public.ca_topics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "super admin topics" ON public.ca_topics FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER ca_topics_updated_at BEFORE UPDATE ON public.ca_topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- super admin manage syllabus tables
GRANT INSERT, UPDATE, DELETE ON public.ca_courses, public.ca_groups, public.ca_subjects TO authenticated;
CREATE POLICY "super admin courses" ON public.ca_courses FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin groups" ON public.ca_groups FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin subjects" ON public.ca_subjects FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- 11. ERROR CENTER triage columns
ALTER TABLE public.error_logs
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
GRANT UPDATE ON public.error_logs TO authenticated;
CREATE POLICY "super admin error triage" ON public.error_logs FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- 12. Super admin visibility over people
CREATE POLICY "super admin reads all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin updates profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin reads all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin manages roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin deletes roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));
GRANT INSERT, DELETE ON public.user_roles TO authenticated;

-- 13. Super admin read access to activity tables for global analytics
CREATE POLICY "super admin reads study sessions" ON public.study_sessions FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin reads planner tasks" ON public.planner_tasks FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin reads papers" ON public.practice_papers FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin reads attempts" ON public.paper_attempts FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin reads memory items" ON public.memory_guard_items FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin reads memory reviews" ON public.memory_guard_reviews FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin reads downloads" ON public.downloads FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin reads notifications" ON public.notifications FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));