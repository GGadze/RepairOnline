-- Migration 005: добавление поддержки аватаров пользователей

CREATE TABLE IF NOT EXISTS avatars (
    id         SERIAL PRIMARY KEY,
    url        VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar_id INT REFERENCES avatars(id) ON DELETE SET NULL;
