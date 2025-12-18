BEGIN;

CREATE OR REPLACE FUNCTION public.get_wallets_by_user_email(p_email varchar)
RETURNS SETOF public.wallets
LANGUAGE sql STABLE
AS $$
  SELECT w.*
  FROM public.wallets w
  JOIN public.users u ON u.id = w.user_id
  WHERE u.email = p_email
  ORDER BY w.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.wallet_upsert_by_email(
  p_email varchar,
  p_currency_code varchar,
  p_address varchar,
  p_balance numeric DEFAULT 0,
  p_is_active boolean DEFAULT false,
  p_wallet_type varchar DEFAULT NULL,
  p_public_key text DEFAULT NULL,
  p_is_verified boolean DEFAULT false
) RETURNS public.wallets AS $$
DECLARE
  v_user_id uuid;
  v_wallet public.wallets;
BEGIN
  SELECT id INTO v_user_id FROM public.users WHERE email = p_email;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_email USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.wallets (
    user_id, address, currency_code, balance, is_active, wallet_type, public_key, is_verified
  ) VALUES (
    v_user_id, p_address, p_currency_code, p_balance, p_is_active, p_wallet_type, p_public_key, p_is_verified
  )
  ON CONFLICT (user_id, currency_code) DO UPDATE SET
    address = EXCLUDED.address,
    balance = EXCLUDED.balance,
    is_active = EXCLUDED.is_active,
    wallet_type = EXCLUDED.wallet_type,
    public_key = EXCLUDED.public_key,
    is_verified = EXCLUDED.is_verified,
    updated_at = now()
  RETURNING * INTO v_wallet;

  RETURN v_wallet;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Examples
-- SELECT * FROM get_wallets_by_user_email('demo@pesa-afrik.io');
-- SELECT wallet_upsert_by_email('demo@pesa-afrik.io','ACT','G-ADDRESS-123',0,true,'stellar',NULL,false);

COMMIT;
