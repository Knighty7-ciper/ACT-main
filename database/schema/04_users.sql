DROP TABLE IF EXISTS users CASCADE;

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
