-- Active sessions for admins
CREATE OR REPLACE FUNCTION public.admin_active_sessions()
RETURNS TABLE(
  session_id uuid,
  user_id uuid,
  email text,
  clinic_name text,
  professional_name text,
  created_at timestamptz,
  updated_at timestamptz,
  not_after timestamptz,
  user_agent text,
  ip text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.user_id,
    u.email::text,
    p.clinic_name,
    p.professional_name,
    s.created_at,
    s.updated_at,
    s.not_after,
    s.user_agent,
    host(s.ip)::text
  FROM auth.sessions s
  JOIN auth.users u ON u.id = s.user_id
  LEFT JOIN public.profiles p ON p.user_id = s.user_id
  WHERE (s.not_after IS NULL OR s.not_after > now())
  ORDER BY s.updated_at DESC NULLS LAST, s.created_at DESC;
END;
$$;

-- Login audit log for admins
CREATE OR REPLACE FUNCTION public.admin_login_audit(days integer DEFAULT 30, lim integer DEFAULT 200)
RETURNS TABLE(
  id uuid,
  occurred_at timestamptz,
  user_id uuid,
  email text,
  action text,
  ip_address text,
  user_agent text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    a.created_at,
    NULLIF(a.payload->'traits'->>'user_id', '')::uuid AS user_id,
    COALESCE(a.payload->'traits'->>'user_email', a.payload->>'actor_username')::text AS email,
    (a.payload->>'action')::text AS action,
    COALESCE(a.ip_address, a.payload->'traits'->>'remote_addr')::text AS ip_address,
    (a.payload->'traits'->>'user_agent')::text AS user_agent
  FROM auth.audit_log_entries a
  WHERE a.created_at >= now() - make_interval(days => days)
    AND a.payload->>'action' IN ('login','logout','token_refreshed','user_signedup','user_recovery_requested','user_modified')
  ORDER BY a.created_at DESC
  LIMIT lim;
END;
$$;