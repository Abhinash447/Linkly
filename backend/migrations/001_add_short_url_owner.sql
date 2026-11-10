CREATE UNIQUE INDEX IF NOT EXISTS users_id_uidx
ON users(id);

ALTER TABLE short_urls
-- Keep this nullable so guest-created and existing links remain unowned.
ADD COLUMN IF NOT EXISTS user_id INTEGER
REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS short_urls_user_id_idx
ON short_urls(user_id);
