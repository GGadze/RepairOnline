-- Migration 006: admin account + order_services table

-- =====================================================
-- Таблица услуг конкретного заказа
-- =====================================================
CREATE TABLE IF NOT EXISTS order_services (
    id           SERIAL PRIMARY KEY,
    order_id     INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    category_id  INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    price        DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(order_id, category_id)
);

-- =====================================================
-- Аккаунт администратора (пароль: Admin1234)
-- bcrypt hash для "Admin1234"
-- =====================================================
INSERT INTO users (email, password_hash, first_name, last_name, phone)
VALUES (
    'admin@remont-online.ru',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkFqbkWBXTy',
    'Администратор',
    'Системный',
    '+70000000000'
)
ON CONFLICT (email) DO NOTHING;

-- Назначаем роль admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@remont-online.ru'
  AND r.name = 'admin'
ON CONFLICT DO NOTHING;

-- =====================================================
-- Индекс для быстрой выборки услуг по заказу
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_order_services_order_id ON order_services(order_id);