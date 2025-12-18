DROP TABLE IF EXISTS countries CASCADE;

CREATE TABLE IF NOT EXISTS countries (
  code         varchar PRIMARY KEY,
  name         varchar NOT NULL,
  region       varchar NULL,
  subregion    varchar NULL,
  currency_code varchar NULL,
  phone_code   varchar NULL,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_countries_currency
    FOREIGN KEY (currency_code) REFERENCES currencies(code)
      ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_countries_active ON countries (is_active);
