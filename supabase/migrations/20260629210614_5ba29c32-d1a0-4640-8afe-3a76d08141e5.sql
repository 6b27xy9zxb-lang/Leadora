
CREATE TABLE public.linkedin_copy_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name text NOT NULL,
  linkedin_url text NOT NULL,
  status text NOT NULL CHECK (status IN ('success','error')),
  error_message text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.linkedin_copy_events TO anon, authenticated;
GRANT ALL ON public.linkedin_copy_events TO service_role;

ALTER TABLE public.linkedin_copy_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can log copy events"
  ON public.linkedin_copy_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
