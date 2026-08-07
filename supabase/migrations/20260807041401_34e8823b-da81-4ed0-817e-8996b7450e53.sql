CREATE TABLE public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  module text,
  page text,
  component text,
  fn text,
  severity text not null default 'error',
  message text not null,
  code text,
  stack text,
  browser text,
  device text,
  network_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

CREATE INDEX error_logs_created_at_idx ON public.error_logs (created_at DESC);
CREATE INDEX error_logs_user_id_idx ON public.error_logs (user_id);

GRANT INSERT ON public.error_logs TO authenticated;
GRANT INSERT ON public.error_logs TO anon;
GRANT SELECT ON public.error_logs TO authenticated;
GRANT ALL ON public.error_logs TO service_role;

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can report an error" ON public.error_logs
  FOR INSERT TO authenticated, anon
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Admins can read error logs" ON public.error_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));