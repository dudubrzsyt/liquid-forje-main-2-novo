CREATE POLICY "Admins insert audit" ON public.audit_logs
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));