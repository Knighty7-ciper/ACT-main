-- Countries
-- 1) List active countries
SELECT * FROM countries WHERE is_active = true ORDER BY name;

-- 2) Upsert country
-- Params: $1 code, $2 name, $3 region, $4 subregion, $5 currency_code, $6 phone_code, $7 is_active
INSERT INTO countries (code, name, region, subregion, currency_code, phone_code, is_active)
VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,true))
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  region = EXCLUDED.region,
  subregion = EXCLUDED.subregion,
  currency_code = EXCLUDED.currency_code,
  phone_code = EXCLUDED.phone_code,
  is_active = EXCLUDED.is_active,
  updated_at = now()
RETURNING *;
