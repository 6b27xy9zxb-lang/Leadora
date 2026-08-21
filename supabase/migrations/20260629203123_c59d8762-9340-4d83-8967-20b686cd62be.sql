
-- 1. Drop overly-permissive anon SELECT on projects (exposed all rows)
DROP POLICY IF EXISTS "anon read projects by token" ON public.projects;

-- 2. Drop anon INSERT-anything policy on preview_views (always-true WITH CHECK)
DROP POLICY IF EXISTS "anyone can insert view" ON public.preview_views;

-- 3. Atomic credit deduction RPCs (eliminates TOCTOU)
CREATE OR REPLACE FUNCTION public.consume_search_credit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  RETURN remaining;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_script_credit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  RETURN remaining;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_search_credit() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.consume_script_credit() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_search_credit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_script_credit() TO authenticated;
