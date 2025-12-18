DROP TABLE IF EXISTS currencies CASCADE;

CREATE TABLE IF NOT EXISTS currencies (
  code            varchar PRIMARY KEY,
  name            varchar NOT NULL,
  symbol          varchar NOT NULL,
  country_code    varchar NULL,
  decimal_places  int NOT NULL DEFAULT 2,
  is_active       boolean NOT NULL DEFAULT true,
  description     text NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_currencies_active ON currencies (is_active);
