-- Migration 008: задаём админу известный пароль
-- =====================================================
-- Аккаунт: admin@remont-online.ru
-- Пароль:  Admin1234
-- (хеш в миграции 006 не соответствовал паролю из комментария,
--  поэтому здесь принудительно выставляем корректный bcrypt-хеш)
-- =====================================================

-- На случай, если админа ещё нет (свежая база без 006) — создаём
INSERT INTO users (email, password_hash, first_name, last_name, phone)
VALUES (
    'admin@remont-online.ru',
    '$2a$12$ICRXpsne76EDgzV36sRVr.0ItrjLOWxETYNBdtfdcYWv7J0YZUlXW',
    'Администратор',
    'Системный',
    '+70000000000'
)
ON CONFLICT (email) DO NOTHING;

-- Обновляем пароль на известный (Admin1234)
UPDATE users
SET password_hash = '$2a$12$ICRXpsne76EDgzV36sRVr.0ItrjLOWxETYNBdtfdcYWv7J0YZUlXW',
    updated_at = NOW()
WHERE email = 'admin@remont-online.ru';

-- Гарантируем роль admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@remont-online.ru'
  AND r.name = 'admin'
ON CONFLICT DO NOTHING;
