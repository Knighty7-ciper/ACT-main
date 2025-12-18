DROP TABLE IF EXISTS wallets CASCADE;

CREATE TABLE IF NOT EXISTS wallets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL,
  address        varchar NOT NULL,
  currency_code  varchar NOT NULL,
  balance        numeric(18,8) NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT false,
  wallet_type    varchar NULL,
  public_key     text NULL,
  is_verified    boolean NOT NULL DEFAULT false,
  verified_at    timestamptz NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wallets_currency FOREIGN KEY (currency_code) REFERENCES currencies(code) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_wallets_user_currency ON wallets (user_id, currency_code);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets (user_id);
