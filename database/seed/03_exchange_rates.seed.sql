-- Seed ACT pairs and FX examples
INSERT INTO exchange_rates (id, from_currency, to_currency, rate, bid, ask, source, is_active)
VALUES
  (gen_random_uuid(), 'ACT', 'NGN', 1200.0000, 1198.0000, 1202.0000, 'seed', true),
  (gen_random_uuid(), 'ACT', 'KES', 150.0000, 149.5000, 150.5000, 'seed', true),
  (gen_random_uuid(), 'ACT', 'ZAR', 18.5000, 18.4000, 18.6000, 'seed', true),
  (gen_random_uuid(), 'ACT', 'GHS', 12.3000, 12.2000, 12.4000, 'seed', true),
  (gen_random_uuid(), 'USD', 'NGN', 1600.0000, 1598.0000, 1602.0000, 'seed', true)
ON CONFLICT (from_currency, to_currency) DO UPDATE SET
  rate = EXCLUDED.rate,
  bid = EXCLUDED.bid,
  ask = EXCLUDED.ask,
  source = EXCLUDED.source,
  is_active = EXCLUDED.is_active,
  updated_at = now();
