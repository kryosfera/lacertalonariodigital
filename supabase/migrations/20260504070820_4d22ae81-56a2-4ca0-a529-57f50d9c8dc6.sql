REVOKE ALL ON FUNCTION public.admin_active_sessions() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_login_audit(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_active_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_login_audit(integer, integer) TO authenticated;