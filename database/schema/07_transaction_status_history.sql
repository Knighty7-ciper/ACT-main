DROP TABLE IF EXISTS transaction_status_history CASCADE;

CREATE TABLE IF NOT EXISTS transaction_status_history (
  id              bigserial PRIMARY KEY,
  transaction_id  uuid NOT NULL,
  status          varchar NOT NULL,
  reason          text NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_tsh_tx FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tsh_tx ON transaction_status_history (transaction_id);
