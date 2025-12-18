BEGIN;

CREATE OR REPLACE FUNCTION public.get_user_by_email(p_email varchar)
RETURNS SETOF public.users
LANGUAGE sql STABLE
AS $$
  SELECT * FROM public.users WHERE email = p_email;
$$;

-- Example
-- SELECT * FROM get_user_by_email('demo@pesa-afrik.io');

COMMIT;
