-- Admin, roles, news
-- 1) Upsert role
-- Params: $1 name, $2 description, $3 permissions, $4 is_active
INSERT INTO roles (name, description, permissions, is_active)
VALUES ($1,$2,COALESCE($3,''),COALESCE($4,true))
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  updated_at = now()
RETURNING *;

-- 2) Assign role to user
-- Params: $1 user_id, $2 role_name
INSERT INTO user_roles (user_id, role_id)
SELECT $1, r.id FROM roles r WHERE r.name = $2
ON CONFLICT (user_id, role_id) DO NOTHING
RETURNING *;

-- 3) Upsert news category
-- Params: $1 slug, $2 name, $3 description, $4 icon, $5 is_active
INSERT INTO news_categories (slug, name, description, icon, is_active)
VALUES ($1,$2,$3,$4,COALESCE($5,true))
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active,
  updated_at = now()
RETURNING *;

-- 4) Create news
-- Params: $1 title, $2 content, $3 summary, $4 category_slug, $5 image_url, $6 source, $7 source_url, $8 is_published, $9 is_featured
INSERT INTO news (title, content, summary, category_id, image_url, source, source_url, is_published, is_featured)
VALUES (
  $1, $2, $3,
  (SELECT id FROM news_categories WHERE slug = $4),
  $5, $6, $7, COALESCE($8,true), COALESCE($9,false)
)
RETURNING *;