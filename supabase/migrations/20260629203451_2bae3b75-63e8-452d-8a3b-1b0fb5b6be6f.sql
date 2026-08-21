
CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false
);

GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Team allowlist by email (Himanshu + Mahi)
CREATE POLICY "team reads contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') IN ('himanshupal151008@gmail.com', 'talwanimahi@gmail.com')
  );

CREATE POLICY "team marks contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') IN ('himanshupal151008@gmail.com', 'talwanimahi@gmail.com')
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') IN ('himanshupal151008@gmail.com', 'talwanimahi@gmail.com')
  );
