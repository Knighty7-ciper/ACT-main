DROP TABLE IF EXISTS news_categories CASCADE;

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
