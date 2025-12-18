-- Create a demo ACT wallet for the demo user
INSERT INTO wallets (
  id, user_id, address, currency_code, balance, is_active, wallet_type, is_verified
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'demo@pesa-afrik.io'),
  'GDEMOACTADDRESS0001',
  'ACT',
  1000.00000000,
  true,
  'stellar',
  true
)
ON CONFLICT (user_id, currency_code) DO UPDATE SET
  address = EXCLUDED.address,
  balance = EXCLUDED.balance,
  is_active = EXCLUDED.is_active,
  wallet_type = EXCLUDED.wallet_type,
  is_verified = EXCLUDED.is_verified,
  updated_at = now();
