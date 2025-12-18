DROP TABLE IF EXISTS economic_indicators CASCADE;

CREATE TABLE IF NOT EXISTS economic_indicators (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code   varchar NOT NULL,
  indicator_type varchar NOT NULL,
  indicator_name varchar NOT NULL,
  value          numeric(18,4) NOT NULL,
  unit           varchar NULL,
  period         varchar NULL,
  source         text NULL,
  release_date   timestamptz NULL,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_ei_country FOREIGN KEY (country_code) REFERENCES countries(code) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_ei_country_type ON economic_indicators (country_code, indicator_type);
