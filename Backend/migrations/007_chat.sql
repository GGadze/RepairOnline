-- Migration 007: chat between client and admin

-- =====================================================
-- Чат-диалоги: один диалог на пользователя с поддержкой
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)  -- у каждого клиента один общий чат с поддержкой
);

-- =====================================================
-- Сообщения чата
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id              SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_from_admin   BOOLEAN NOT NULL DEFAULT FALSE,
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(conversation_id, is_read) WHERE is_read = FALSE;