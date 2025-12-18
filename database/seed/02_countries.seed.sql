INSERT INTO countries (code, name, region, subregion, currency_code, phone_code, is_active)
VALUES
  ('NG', 'Nigeria', 'Africa', 'Western Africa', 'NGN', '+234', true),
  ('KE', 'Kenya', 'Africa', 'Eastern Africa', 'KES', '+254', true),
  ('ZA', 'South Africa', 'Africa', 'Southern Africa', 'ZAR', '+27', true),
  ('GH', 'Ghana', 'Africa', 'Western Africa', 'GHS', '+233', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  region = EXCLUDED.region,
  subregion = EXCLUDED.subregion,
  currency_code = EXCLUDED.currency_code,
  phone_code = EXCLUDED.phone_code,
  is_active = EXCLUDED.is_active,
  updated_at = now();
