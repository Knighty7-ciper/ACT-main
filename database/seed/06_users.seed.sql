-- Creates/updates a demo user with a bcrypt password using pgcrypto
INSERT INTO users (
  id, email, password, first_name, last_name, phone_number, role, is_email_verified, is_active, country_code
) VALUES (
  gen_random_uuid(), 'demo@pesa-afrik.io', crypt('PesaAfrik123!', gen_salt('bf')), 'Demo', 'User', '+254700000000', 'user', true, true, 'KE'
)
ON CONFLICT (email) DO UPDATE SET
  password = crypt('PesaAfrik123!', gen_salt('bf')),
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone_number = EXCLUDED.phone_number,
  role = EXCLUDED.role,
  is_email_verified = EXCLUDED.is_email_verified,
  is_active = EXCLUDED.is_active,
  country_code = EXCLUDED.country_code,
  updated_at = now();
