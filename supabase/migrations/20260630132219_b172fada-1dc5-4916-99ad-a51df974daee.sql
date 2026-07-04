
-- 1. contact_messages: add INSERT policy with field validation
GRANT INSERT ON public.contact_messages TO anon, authenticated;
CREATE POLICY "anyone can submit contact message"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 200
    AND length(btrim(email)) BETWEEN 3 AND 320
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(btrim(message)) BETWEEN 1 AND 5000
  );

-- 2. linkedin_copy_events: replace permissive INSERT policy with validated one, add user_id column
ALTER TABLE public.linkedin_copy_events ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
DROP POLICY IF EXISTS "anyone can log copy events" ON public.linkedin_copy_events;
CREATE POLICY "log copy events with validation"
  ON public.linkedin_copy_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(member_name)) BETWEEN 1 AND 200
    AND length(btrim(linkedin_url)) BETWEEN 1 AND 2048
    AND status IN ('success','error')
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- 3. projects: ensure no anonymous access. Revoke any anon grants if present.
REVOKE ALL ON public.projects FROM anon;

-- 4. Lock down SECURITY DEFINER credit functions: only service_role may invoke.
REVOKE EXECUTE ON FUNCTION public.consume_search_credit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.consume_script_credit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_search_credit() TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_script_credit() TO service_role;
