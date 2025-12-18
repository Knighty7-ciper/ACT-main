INSERT INTO news (
  id, title, content, summary, category_id, image_url, source, source_url, is_published, is_featured, view_count, published_at
) VALUES (
  gen_random_uuid(),
  'ACT basket rebalanced',
  'We have updated ACT basket composition to improve stability.',
  'ACT basket rebalanced for enhanced stability',
  (SELECT id FROM news_categories WHERE slug = 'system-updates'),
  NULL,
  'ACP',
  NULL,
  true,
  false,
  0,
  now()
)
ON CONFLICT DO NOTHING;
