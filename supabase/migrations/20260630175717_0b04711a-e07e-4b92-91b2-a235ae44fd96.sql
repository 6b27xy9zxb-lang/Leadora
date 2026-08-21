-- Harden projects: ensure anon has no privileges; create a safe public view for preview consumption
REVOKE ALL ON public.projects FROM anon;

CREATE OR REPLACE VIEW public.projects_public AS
SELECT id, business_name, category, city, phone, preview_token
FROM public.projects;

ALTER VIEW public.projects_public SET (security_invoker = true);
REVOKE ALL ON public.projects_public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.projects_public TO service_role;

-- linkedin_copy_events: add explicit owner-scoped SELECT policy
DROP POLICY IF EXISTS "owners can read their copy events" ON public.linkedin_copy_events;
CREATE POLICY "owners can read their copy events"
ON public.linkedin_copy_events
FOR SELECT
TO authenticated
USING (user_id IS NOT NULL AND auth.uid() = user_id);