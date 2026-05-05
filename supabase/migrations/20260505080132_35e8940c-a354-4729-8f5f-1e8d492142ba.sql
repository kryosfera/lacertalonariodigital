
CREATE TABLE public.user_deletion_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deleted_user_id uuid NOT NULL,
  deleted_user_email text,
  deleted_user_label text,
  deleted_by uuid NOT NULL,
  deleted_by_email text,
  reason text,
  deleted_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_deletion_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view deletion audit"
ON public.user_deletion_audit
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_user_deletion_audit_deleted_at ON public.user_deletion_audit (deleted_at DESC);
