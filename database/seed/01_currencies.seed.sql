INSERT INTO currencies (code, name, symbol, country_code, decimal_places, is_active, description)
VALUES
  ('ACT', 'African Currency Token', 'ACT', NULL, 8, true, 'Basket-backed stable token'),
  ('NGN', 'Nigerian Naira', '₦', 'NG', 2, true, NULL),
  ('KES', 'Kenyan Shilling', 'Ksh', 'KE', 2, true, NULL),
  ('ZAR', 'South African Rand', 'R', 'ZA', 2, true, NULL),
  ('GHS', 'Ghanaian Cedi', '₵', 'GH', 2, true, NULL),
  ('USD', 'US Dollar', '$', 'US', 2, true, NULL),
  ('EUR', 'Euro', '€', 'EU', 2, true, NULL)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  symbol = EXCLUDED.symbol,
  country_code = EXCLUDED.country_code,
  decimal_places = EXCLUDED.decimal_places,
  is_active = EXCLUDED.is_active,
  description = EXCLUDED.description,
  updated_at = now();
