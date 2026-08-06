
-- profiles: daily target
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_target_minutes integer NOT NULL DEFAULT 360;

-- study sessions
CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text,
  chapter text,
  topic text,
  minutes integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'manual',
  studied_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO authenticated;
GRANT ALL ON public.study_sessions TO service_role;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own study sessions" ON public.study_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX study_sessions_user_date_idx ON public.study_sessions (user_id, studied_on DESC);
CREATE TRIGGER study_sessions_updated_at BEFORE UPDATE ON public.study_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- planner tasks
CREATE TABLE public.planner_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  subject text,
  chapter text,
  topic text,
  task_type text NOT NULL DEFAULT 'study',
  scheduled_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  start_time time,
  duration_min integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'upcoming',
  priority integer NOT NULL DEFAULT 2,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planner_tasks TO authenticated;
GRANT ALL ON public.planner_tasks TO service_role;
ALTER TABLE public.planner_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own planner tasks" ON public.planner_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX planner_tasks_user_date_idx ON public.planner_tasks (user_id, scheduled_date);
CREATE TRIGGER planner_tasks_updated_at BEFORE UPDATE ON public.planner_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- practice papers
CREATE TABLE public.practice_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  subject text,
  chapter text,
  question_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'generated',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_papers TO authenticated;
GRANT ALL ON public.practice_papers TO service_role;
ALTER TABLE public.practice_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own practice papers" ON public.practice_papers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX practice_papers_user_idx ON public.practice_papers (user_id, created_at DESC);
CREATE TRIGGER practice_papers_updated_at BEFORE UPDATE ON public.practice_papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- paper attempts
CREATE TABLE public.paper_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  paper_id uuid REFERENCES public.practice_papers(id) ON DELETE SET NULL,
  subject text,
  chapter text,
  topic text,
  attempt_kind text NOT NULL DEFAULT 'paper',
  questions_attempted integer NOT NULL DEFAULT 0,
  questions_correct integer NOT NULL DEFAULT 0,
  time_spent_min integer NOT NULL DEFAULT 0,
  attempted_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paper_attempts TO authenticated;
GRANT ALL ON public.paper_attempts TO service_role;
ALTER TABLE public.paper_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own paper attempts" ON public.paper_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX paper_attempts_user_idx ON public.paper_attempts (user_id, attempted_on DESC);
CREATE TRIGGER paper_attempts_updated_at BEFORE UPDATE ON public.paper_attempts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- memory guard
CREATE TABLE public.memory_guard_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text,
  chapter text,
  topic text NOT NULL,
  strength integer NOT NULL DEFAULT 0,
  next_review_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  last_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_guard_items TO authenticated;
GRANT ALL ON public.memory_guard_items TO service_role;
ALTER TABLE public.memory_guard_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own memory items" ON public.memory_guard_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX memory_guard_items_user_idx ON public.memory_guard_items (user_id, next_review_on);
CREATE TRIGGER memory_guard_items_updated_at BEFORE UPDATE ON public.memory_guard_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.memory_guard_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id uuid REFERENCES public.memory_guard_items(id) ON DELETE CASCADE,
  subject text,
  recall_score integer NOT NULL DEFAULT 0,
  reviewed_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_guard_reviews TO authenticated;
GRANT ALL ON public.memory_guard_reviews TO service_role;
ALTER TABLE public.memory_guard_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own memory reviews" ON public.memory_guard_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX memory_guard_reviews_user_idx ON public.memory_guard_reviews (user_id, reviewed_on DESC);

-- downloads
CREATE TABLE public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'paper',
  subject text,
  file_url text,
  paper_id uuid REFERENCES public.practice_papers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.downloads TO authenticated;
GRANT ALL ON public.downloads TO service_role;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own downloads" ON public.downloads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX downloads_user_idx ON public.downloads (user_id, created_at DESC);

-- notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);

-- motivational quotes
CREATE TABLE public.motivational_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  author text NOT NULL DEFAULT 'Kixto',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.motivational_quotes TO authenticated;
GRANT ALL ON public.motivational_quotes TO service_role;
ALTER TABLE public.motivational_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes readable by signed in users" ON public.motivational_quotes FOR SELECT TO authenticated USING (true);

CREATE TABLE public.quote_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quote_id uuid NOT NULL REFERENCES public.motivational_quotes(id) ON DELETE CASCADE,
  shown_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, shown_on)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_history TO authenticated;
GRANT ALL ON public.quote_history TO service_role;
ALTER TABLE public.quote_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own quote history" ON public.quote_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- module access
CREATE TABLE public.user_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module)
);
GRANT SELECT ON public.user_modules TO authenticated;
GRANT ALL ON public.user_modules TO service_role;
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own modules" ON public.user_modules FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.planner_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.practice_papers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.paper_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.memory_guard_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.memory_guard_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.downloads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

INSERT INTO public.motivational_quotes (quote, author) VALUES
('Discipline today leads to success tomorrow.', 'Kixto'),
('Small daily progress beats occasional perfection.', 'Kixto'),
('You do not have to be extreme, just consistent.', 'Kixto'),
('The exam rewards the hours nobody saw.', 'Kixto'),
('Revision is where learning actually happens.', 'Kixto'),
('One chapter a day keeps panic away.', 'Kixto'),
('Focus on the next hour, not the whole syllabus.', 'Kixto'),
('Your future self is watching you right now.', 'Kixto'),
('Hard now, easy later. Easy now, hard later.', 'Kixto'),
('Consistency compounds faster than talent.', 'Kixto'),
('Start before you feel ready.', 'Kixto'),
('Mistakes in practice save marks in the exam.', 'Kixto'),
('Study smart, then study more.', 'Kixto'),
('Progress is quiet until it is obvious.', 'Kixto'),
('Every solved question is a rank you earn.', 'Kixto'),
('Do not count the days, make the days count.', 'Kixto'),
('Clarity comes from action, not thought.', 'Kixto'),
('Weak areas today, strong areas next month.', 'Kixto'),
('You are one focused session away from momentum.', 'Kixto'),
('Consistency is the shortcut nobody advertises.', 'Kixto'),
('Master the basics and the rest follows.', 'Kixto'),
('Two hours of focus beats eight hours of scrolling.', 'Kixto'),
('The syllabus is finite. Your effort decides the rest.', 'Kixto'),
('Show up especially on the days you do not feel like it.', 'Kixto'),
('Track it, and it improves.', 'Kixto'),
('Rest is part of the plan, not a break from it.', 'Kixto'),
('Difficult roads lead to CA final results.', 'Kixto'),
('Reading is input. Practice is proof.', 'Kixto'),
('Beat yesterday, not everyone else.', 'Kixto'),
('Preparation removes fear.', 'Kixto'),
('Your notes are only as good as your revisions.', 'Kixto'),
('Discomfort is the price of a rank.', 'Kixto'),
('Finish what you planned, then celebrate.', 'Kixto'),
('Momentum is built one checkbox at a time.', 'Kixto'),
('Doubt fades when the pages turn.', 'Kixto'),
('Study now so the exam feels like revision.', 'Kixto'),
('Consistency turns pressure into confidence.', 'Kixto'),
('Nobody regrets the session they completed.', 'Kixto'),
('Aim for done, then aim for perfect.', 'Kixto'),
('Every expert was once a first attempt.', 'Kixto');
