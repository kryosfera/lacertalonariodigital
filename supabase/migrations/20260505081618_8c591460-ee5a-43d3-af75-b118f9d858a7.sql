
-- Admin RPCs to inspect email queue health and recent failures.

CREATE OR REPLACE FUNCTION public.admin_email_queue_stats()
RETURNS TABLE(
  queued_auth bigint,
  queued_transactional bigint,
  dlq_auth bigint,
  dlq_transactional bigint,
  sent_24h bigint,
  failed_24h bigint,
  suppressed_total bigint,
  retry_after_until timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  q_auth bigint := 0;
  q_tx bigint := 0;
  d_auth bigint := 0;
  d_tx bigint := 0;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  BEGIN SELECT queue_length INTO q_auth FROM pgmq.metrics('auth_emails'); EXCEPTION WHEN OTHERS THEN q_auth := 0; END;
  BEGIN SELECT queue_length INTO q_tx FROM pgmq.metrics('transactional_emails'); EXCEPTION WHEN OTHERS THEN q_tx := 0; END;
  BEGIN SELECT queue_length INTO d_auth FROM pgmq.metrics('auth_emails_dlq'); EXCEPTION WHEN OTHERS THEN d_auth := 0; END;
  BEGIN SELECT queue_length INTO d_tx FROM pgmq.metrics('transactional_emails_dlq'); EXCEPTION WHEN OTHERS THEN d_tx := 0; END;

  RETURN QUERY
  WITH latest AS (
    SELECT DISTINCT ON (message_id) status, created_at
    FROM email_send_log
    WHERE message_id IS NOT NULL AND created_at >= now() - interval '24 hours'
    ORDER BY message_id, created_at DESC
  )
  SELECT
    COALESCE(q_auth, 0),
    COALESCE(q_tx, 0),
    COALESCE(d_auth, 0),
    COALESCE(d_tx, 0),
    (SELECT COUNT(*) FROM latest WHERE status = 'sent')::bigint,
    (SELECT COUNT(*) FROM latest WHERE status IN ('dlq','failed','bounced'))::bigint,
    (SELECT COUNT(*) FROM suppressed_emails)::bigint,
    (SELECT s.retry_after_until FROM email_send_state s WHERE s.id = 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_email_recent_logs(lim integer DEFAULT 100)
RETURNS TABLE(
  id uuid,
  created_at timestamptz,
  template_name text,
  recipient_email text,
  status text,
  error_message text,
  message_id text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT DISTINCT ON (l.message_id)
    l.id, l.created_at, l.template_name, l.recipient_email,
    l.status, l.error_message, l.message_id
  FROM email_send_log l
  WHERE l.message_id IS NOT NULL
  ORDER BY l.message_id, l.created_at DESC
  LIMIT lim;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_recent_signup_attempts(lim integer DEFAULT 50)
RETURNS TABLE(
  occurred_at timestamptz,
  email text,
  action text,
  ip_address text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT
    a.created_at,
    COALESCE(a.payload->>'actor_username', a.payload->'traits'->>'user_email')::text AS email,
    (a.payload->>'action')::text AS action,
    COALESCE(a.ip_address, a.payload->'traits'->>'remote_addr')::text AS ip_address
  FROM auth.audit_log_entries a
  WHERE a.payload->>'action' IN ('user_signedup','user_confirmation_requested','user_recovery_requested','user_invited')
    AND a.created_at >= now() - interval '7 days'
  ORDER BY a.created_at DESC
  LIMIT lim;
END;
$$;
