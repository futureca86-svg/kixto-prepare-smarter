CREATE OR REPLACE FUNCTION public.admin_db_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  SELECT jsonb_build_object(
    'db_size_bytes', pg_database_size(current_database()),
    'table_count', (SELECT count(*) FROM pg_tables WHERE schemaname = 'public'),
    'live_rows', (SELECT COALESCE(sum(n_live_tup), 0) FROM pg_stat_user_tables)
  ) INTO result;
  RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.admin_db_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_db_stats() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_auth_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth, pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'confirmed_users', (SELECT count(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL),
    'active_sessions', (SELECT count(*) FROM auth.sessions WHERE COALESCE(not_after, now() + interval '1 hour') > now()),
    'signins_24h', (SELECT count(*) FROM auth.users WHERE last_sign_in_at > now() - interval '24 hours'),
    'new_users_7d', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '7 days')
  ) INTO result;
  RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.admin_auth_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_auth_stats() TO authenticated;