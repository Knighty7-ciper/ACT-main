// Initial schema migration (Postgres)
// up: creates extensions and all core tables; down: drops them in reverse order

module.exports = {
  up: `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- currencies
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

-- countries
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
  CONSTRAINT fk_countries_currency FOREIGN KEY (currency_code) REFERENCES currencies(code)
    ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_countries_active ON countries (is_active);

-- exchange_rates
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

-- users
CREATE TABLE IF NOT EXISTS users (
  id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                        varchar NOT NULL UNIQUE,
  password                     varchar NOT NULL,
  first_name                   varchar NOT NULL,
  last_name                    varchar NULL,
  phone_number                 varchar NULL,
  profile_image                varchar NULL,
  bio                          text NULL,
  role                         varchar NOT NULL DEFAULT 'user',
  is_email_verified            boolean NOT NULL DEFAULT false,
  is_active                    boolean NOT NULL DEFAULT true,
  email_verification_token     varchar NULL,
  email_verification_token_expiry timestamptz NULL,
  password_reset_token         varchar NULL,
  password_reset_token_expiry  timestamptz NULL,
  last_login_at                timestamptz NULL,
  country_code                 varchar NULL,
  referral_code                varchar NULL,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_users_country FOREIGN KEY (country_code) REFERENCES countries(code) ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_users_active ON users (is_active);
CREATE INDEX IF NOT EXISTS idx_users_country ON users (country_code);

-- wallets
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

-- transactions
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

-- transaction_status_history
CREATE TABLE IF NOT EXISTS transaction_status_history (
  id              bigserial PRIMARY KEY,
  transaction_id  uuid NOT NULL,
  status          varchar NOT NULL,
  reason          text NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_tsh_tx FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_tsh_tx ON transaction_status_history (transaction_id);

-- news_categories
CREATE TABLE IF NOT EXISTS news_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        varchar NOT NULL UNIQUE,
  name        varchar NOT NULL,
  description text NULL,
  icon        varchar NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- news
CREATE TABLE IF NOT EXISTS news (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        varchar NOT NULL,
  content      text NOT NULL,
  summary      text NULL,
  category_id  uuid NOT NULL,
  image_url    varchar NULL,
  source       varchar NULL,
  source_url   varchar NULL,
  is_published boolean NOT NULL DEFAULT true,
  is_featured  boolean NOT NULL DEFAULT false,
  view_count   int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz NULL,
  CONSTRAINT fk_news_category FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_news_published ON news (is_published);

-- economic_indicators
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

-- roles
CREATE TABLE IF NOT EXISTS roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar NOT NULL UNIQUE,
  description text NULL,
  permissions text NOT NULL DEFAULT '',
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ur_role ON user_roles (role_id);

-- admins
CREATE TABLE IF NOT EXISTS admins (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        varchar NOT NULL UNIQUE,
  password     varchar NOT NULL,
  first_name   varchar NOT NULL,
  last_name    varchar NULL,
  role         varchar NOT NULL DEFAULT 'admin',
  admin_level  varchar NOT NULL DEFAULT 'super_admin',
  is_active    boolean NOT NULL DEFAULT true,
  last_login_at timestamptz NULL,
  permissions  text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
`,
  down: `
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS news_categories CASCADE;
DROP TABLE IF EXISTS transaction_status_history CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS economic_indicators CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS currencies CASCADE;
`,
};
