INSERT INTO roles (id, name, description, permissions, is_active)
VALUES
  (gen_random_uuid(), 'user', 'Standard user role', '', true),
  (gen_random_uuid(), 'admin', 'Administrator', 'manage:users,manage:content', true),
  (gen_random_uuid(), 'super_admin', 'Super administrator', 'manage:all', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  updated_at = now();
