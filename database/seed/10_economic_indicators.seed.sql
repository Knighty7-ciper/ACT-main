INSERT INTO economic_indicators (
  id, country_code, indicator_type, indicator_name, value, unit, period, source, release_date, is_active
) VALUES (
  gen_random_uuid(), 'KE', 'inflation', 'CPI YoY', 5.60, '%', 'Sep 2025', 'KNBS', now(), true
)
ON CONFLICT DO NOTHING;
