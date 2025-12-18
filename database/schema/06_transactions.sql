DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE IF NOT EXISTS transactions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL,
  wallet_id               uuid NULL,
  type                    varchar NOT NULL,
  from_currency           varchar NOT NULL,
  to_currency             varchar NOT NULL,
  from_amount             numeric(18,8) NOT NULL,
  to_amount               numeric(18,8) NOT NULL,
  fee                     numeric(18,8) NULL,
  status                  varchar NOT NULL DEFAULT 'pending',
  description             text NULL,
  reference_number        varchar NULL,
  stellar_transaction_hash varchar NULL,
  metadata                jsonb NULL,
  completed_at            timestamptz NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tx_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
  CONSTRAINT fk_tx_from_currency FOREIGN KEY (from_currency) REFERENCES currencies(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_tx_to_currency   FOREIGN KEY (to_currency)   REFERENCES currencies(code) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions (status);
CREATE INDEX IF NOT EXISTS idx_tx_ref ON transactions (reference_number);
