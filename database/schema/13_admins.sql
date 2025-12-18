DROP TABLE IF EXISTS admins CASCADE;

CREATE TABLE IF NOT EXISTS admins (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        varchar NOT NULL UNIQUE,
  password     varchar NOT NULL,
  first_name   varchar NOT NULL,
  last_name    varchar NULL,
  role         varchar NOT NULL DEFAULT 'admin',
  admin_level  varchar NOT NULL DEFAULT 'super_admin',
  is_active    boolean NOT NULL DEFAULT true,
  last_login_at timestamptz NULL,
  permissions  text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
