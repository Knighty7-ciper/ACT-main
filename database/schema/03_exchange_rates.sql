DROP TABLE IF EXISTS exchange_rates CASCADE;

CREATE TABLE IF NOT EXISTS exchange_rates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency varchar NOT NULL,
  to_currency   varchar NOT NULL,
  rate         numeric(18,8) NOT NULL,
  bid          numeric(18,8) NULL,
  ask          numeric(18,8) NULL,
  source       varchar NULL,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_exr_from_currency FOREIGN KEY (from_currency) REFERENCES currencies(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_exr_to_currency   FOREIGN KEY (to_currency)   REFERENCES currencies(code) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_exchange_rates_pair ON exchange_rates (from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_active ON exchange_rates (is_active);
