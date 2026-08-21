
CREATE TABLE public.credit_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action text NOT NULL,
  amount integer NOT NULL,
  balance_after integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX credit_audit_log_user_id_created_at_idx ON public.credit_audit_log (user_id, created_at DESC);

GRANT SELECT ON public.credit_audit_log TO authenticated;
GRANT ALL ON public.credit_audit_log TO service_role;

ALTER TABLE public.credit_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own audit read" ON public.credit_audit_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.consume_search_credit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  remaining integer;
BEGIN
  UPDATE public.profiles
  SET search_credits = search_credits - 1
  WHERE id = auth.uid() AND search_credits > 0
  RETURNING search_credits INTO remaining;
  IF remaining IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO public.credit_audit_log (user_id, action, amount, balance_after)
  VALUES (auth.uid(), 'search', 1, remaining);
  RETURN remaining;
END;
$function$;

CREATE OR REPLACE FUNCTION public.consume_script_credit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  remaining integer;
BEGIN
  UPDATE public.profiles
  SET script_credits = script_credits - 1
  WHERE id = auth.uid() AND script_credits > 0
  RETURNING script_credits INTO remaining;
  IF remaining IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO public.credit_audit_log (user_id, action, amount, balance_after)
  VALUES (auth.uid(), 'script', 1, remaining);
  RETURN remaining;
END;
$function$;
