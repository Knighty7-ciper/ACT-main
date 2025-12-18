BEGIN;

-- Ensure unique index for reference_number exists
CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_reference_number
  ON public.transactions (reference_number)
  WHERE reference_number IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_transaction_by_email(
  p_user_email varchar,
  p_wallet_currency varchar,
  p_type varchar,
  p_from_currency varchar,
  p_to_currency varchar,
  p_from_amount numeric,
  p_to_amount numeric,
  p_fee numeric DEFAULT NULL,
  p_status varchar DEFAULT 'pending',
  p_description text DEFAULT NULL,
  p_reference_number varchar DEFAULT NULL,
  p_stellar_transaction_hash varchar DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL,
  p_completed boolean DEFAULT false
) RETURNS public.transactions AS $$
DECLARE
  v_user_id uuid;
  v_wallet_id uuid;
  v_tx public.transactions;
  v_completed_at timestamptz;
BEGIN
  SELECT id INTO v_user_id FROM public.users WHERE email = p_user_email;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_user_email USING ERRCODE = '22023';
  END IF;

  IF p_wallet_currency IS NOT NULL THEN
    SELECT id INTO v_wallet_id FROM public.wallets
      WHERE user_id = v_user_id AND currency_code = p_wallet_currency
      LIMIT 1;
  END IF;

  IF p_completed THEN
    v_completed_at := now();
  END IF;

  INSERT INTO public.transactions (
    user_id, wallet_id, type, from_currency, to_currency, from_amount, to_amount, fee, status, description, reference_number, stellar_transaction_hash, metadata, completed_at
  ) VALUES (
    v_user_id, v_wallet_id, p_type, p_from_currency, p_to_currency, p_from_amount, p_to_amount, p_fee, p_status, p_description, p_reference_number, p_stellar_transaction_hash, p_metadata, v_completed_at
  )
  ON CONFLICT (reference_number) DO UPDATE SET
    status = EXCLUDED.status,
    description = EXCLUDED.description,
    stellar_transaction_hash = EXCLUDED.stellar_transaction_hash,
    metadata = EXCLUDED.metadata,
    completed_at = EXCLUDED.completed_at,
    updated_at = now()
  RETURNING * INTO v_tx;

  RETURN v_tx;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Example
-- SELECT create_transaction_by_email('demo@pesa-afrik.io','ACT','transfer','ACT','NGN',10,12000,0.01,'completed','Demo transfer','REF-DEMO-0002','{"channel":"seed"}', true);

COMMIT;
