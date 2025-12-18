DROP TABLE IF EXISTS news CASCADE;

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
