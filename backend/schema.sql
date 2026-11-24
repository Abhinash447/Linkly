-- schema.sql for Neon

-- users
CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_email_key UNIQUE (email)
);

-- short_urls
CREATE TABLE short_urls (
    id           SERIAL PRIMARY KEY,
    original_url VARCHAR,
    short_code   VARCHAR,
    created_at   DATE,
    clicks_count INTEGER NOT NULL DEFAULT 0,
    user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX short_urls_short_code_key ON short_urls (short_code);
CREATE INDEX short_urls_user_id_idx ON short_urls (user_id);

-- click_events
CREATE TABLE click_events (
    id           SERIAL PRIMARY KEY,
    short_url_id INTEGER REFERENCES short_urls(id) ON DELETE CASCADE,
    clicked_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    country      VARCHAR(2)
);

-- schema_migrations
CREATE TABLE schema_migrations (
    filename   TEXT NOT NULL PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);