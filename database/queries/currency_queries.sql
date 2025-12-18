BEGIN;

CREATE OR REPLACE FUNCTION public.currency_upsert(
  p_code varchar,
  p_name varchar,
  p_symbol varchar,
  p_country_code varchar DEFAULT NULL,
  p_decimal_places int DEFAULT 2,
  p_is_active boolean DEFAULT true,
  p_description text DEFAULT NULL
) RETURNS public.currencies AS $$
DECLARE
  v_currency public.currencies;
BEGIN
  INSERT INTO public.currencies (
    code, name, symbol, country_code, decimal_places, is_active, description
  ) VALUES (
    p_code, p_name, p_symbol, p_country_code, COALESCE(p_decimal_places, 2), COALESCE(p_is_active, true), p_description
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    symbol = EXCLUDED.symbol,
    country_code = EXCLUDED.country_code,
    decimal_places = EXCLUDED.decimal_places,
    is_active = EXCLUDED.is_active,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING * INTO v_currency;

  RETURN v_currency;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Examples
-- SELECT currency_upsert('ACT','Afrik Coin Token','ACT', NULL, 8, true, 'Utility token');
-- SELECT currency_upsert('NGN','Nigerian Naira','₦','NG', 2, true, NULL);

COMMIT;
