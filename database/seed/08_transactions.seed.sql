-- Create a sample completed transaction for the demo user
INSERT INTO transactions (
  id, user_id, wallet_id, type, from_currency, to_currency, from_amount, to_amount, fee, status, description, reference_number, stellar_transaction_hash, metadata, completed_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'demo@pesa-afrik.io'),
  (SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'demo@pesa-afrik.io') AND currency_code = 'ACT'),
  'transfer',
  'ACT','NGN', 10.00000000, 12000.00000000, 0.01000000,
  'completed',
  'Demo seed transfer',
  'REF-DEMO-0001',
  'TXHASHDEMO0001',
  '{"channel":"seed"}'::jsonb,
  now()
)
ON CONFLICT (reference_number) DO UPDATE SET
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  stellar_transaction_hash = EXCLUDED.stellar_transaction_hash,
  metadata = EXCLUDED.metadata,
  completed_at = EXCLUDED.completed_at,
  updated_at = now();
