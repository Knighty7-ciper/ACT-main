BEGIN;

CREATE OR REPLACE FUNCTION public.country_upsert(
  p_code varchar,
  p_name varchar,
  p_region varchar DEFAULT NULL,
  p_subregion varchar DEFAULT NULL,
  p_currency_code varchar DEFAULT NULL,
  p_phone_code varchar DEFAULT NULL,
  p_is_active boolean DEFAULT true
) RETURNS public.countries AS $$
DECLARE
  v_country public.countries;
BEGIN
  INSERT INTO public.countries (
    code, name, region, subregion, currency_code, phone_code, is_active
  ) VALUES (
    p_code, p_name, p_region, p_subregion, p_currency_code, p_phone_code, COALESCE(p_is_active, true)
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    region = EXCLUDED.region,
    subregion = EXCLUDED.subregion,
    currency_code = EXCLUDED.currency_code,
    phone_code = EXCLUDED.phone_code,
    is_active = EXCLUDED.is_active,
    updated_at = now()
  RETURNING * INTO v_country;

  RETURN v_country;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Examples
-- SELECT country_upsert('KE','Kenya','Africa','Eastern Africa','KES','+254', true);
-- SELECT country_upsert('NG','Nigeria','Africa','Western Africa','NGN','+234', true);

COMMIT;
