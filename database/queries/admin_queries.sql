BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.admin_upsert(
  p_email varchar,
  p_password_plain text,
  p_first_name varchar,
  p_last_name varchar DEFAULT NULL,
  p_is_active boolean DEFAULT true,
  p_admin_level varchar DEFAULT 'super_admin',
  p_role varchar DEFAULT 'admin',
  p_permissions text DEFAULT ''
) RETURNS public.admins AS $$
DECLARE
  v_admin public.admins;
BEGIN
  INSERT INTO public.admins (
    email, password, first_name, last_name, is_active, admin_level, role, permissions
  ) VALUES (
    p_email,
    crypt(p_password_plain, gen_salt('bf')),
    p_first_name, p_last_name, COALESCE(p_is_active, true), p_admin_level, p_role, COALESCE(p_permissions, '')
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_active = EXCLUDED.is_active,
    admin_level = EXCLUDED.admin_level,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = now()
  RETURNING * INTO v_admin;

  RETURN v_admin;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Example
-- SELECT admin_upsert('admin@pesa-afrik.io','ChangeMe123!','Admin','User', true);

COMMIT;
