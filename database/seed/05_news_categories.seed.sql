INSERT INTO news_categories (id, slug, name, description, icon, is_active)
VALUES
  (gen_random_uuid(), 'system-updates', 'System Updates', 'Platform and system notices', 'megaphone', true),
  (gen_random_uuid(), 'market', 'Market', 'Market news and analysis', 'chart', true),
  (gen_random_uuid(), 'education', 'Education', 'Guides and tutorials', 'book', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active,
  updated_at = now();
