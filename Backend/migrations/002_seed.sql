-- =====================================================
-- Тестовые данные для Ремонт-Онлайн
-- =====================================================

-- Категории
INSERT INTO categories (name, parent_id, level, base_price) VALUES
('Смартфоны',       NULL, 0, 0),
('Ноутбуки',        NULL, 0, 0),
('Планшеты',        NULL, 0, 0),
('Телевизоры',      NULL, 0, 0),
('Бытовая техника', NULL, 0, 0),
('Другое',          NULL, 0, 0)
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Apple',   id, 1, 0 FROM categories WHERE name = 'Смартфоны' AND parent_id IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Samsung', id, 1, 0 FROM categories WHERE name = 'Смартфоны' AND parent_id IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Xiaomi',  id, 1, 0 FROM categories WHERE name = 'Смартфоны' AND parent_id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Lenovo', id, 1, 0 FROM categories WHERE name = 'Ноутбуки' AND parent_id IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Asus',   id, 1, 0 FROM categories WHERE name = 'Ноутбуки' AND parent_id IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'HP',     id, 1, 0 FROM categories WHERE name = 'Ноутбуки' AND parent_id IS NULL
ON CONFLICT DO NOTHING;

-- Услуги Apple
INSERT INTO categories (name, parent_id, level, base_price)
SELECT v.name, c.id, 2, v.price FROM categories c,
(VALUES
  ('Замена стекла', 2500),
  ('Замена аккумулятора', 4500),
  ('Замена дисплея', 9000),
  ('Ремонт разъёма зарядки', 2800),
  ('Восстановление после воды', 6500)
) AS v(name, price)
WHERE c.name = 'Apple'
ON CONFLICT DO NOTHING;

-- Услуги Samsung
INSERT INTO categories (name, parent_id, level, base_price)
SELECT v.name, c.id, 2, v.price FROM categories c,
(VALUES
  ('Замена стекла', 1800),
  ('Замена аккумулятора', 3500),
  ('Замена дисплея', 7500),
  ('Ремонт разъёма зарядки', 2200),
  ('Чистка от пыли', 1200)
) AS v(name, price)
WHERE c.name = 'Samsung'
ON CONFLICT DO NOTHING;

-- Услуги Xiaomi
INSERT INTO categories (name, parent_id, level, base_price)
SELECT v.name, c.id, 2, v.price FROM categories c,
(VALUES
  ('Замена стекла', 1500),
  ('Замена аккумулятора', 2800),
  ('Замена дисплея', 5500),
  ('Ремонт кнопок', 1800)
) AS v(name, price)
WHERE c.name = 'Xiaomi'
ON CONFLICT DO NOTHING;

-- Услуги Lenovo
INSERT INTO categories (name, parent_id, level, base_price)
SELECT v.name, c.id, 2, v.price FROM categories c,
(VALUES
  ('Замена термопасты', 2000),
  ('Замена клавиатуры', 3500),
  ('Чистка системы охлаждения', 2500),
  ('Замена матрицы', 12000),
  ('Замена аккумулятора', 7000)
) AS v(name, price)
WHERE c.name = 'Lenovo'
ON CONFLICT DO NOTHING;

-- Услуги Asus
INSERT INTO categories (name, parent_id, level, base_price)
SELECT v.name, c.id, 2, v.price FROM categories c,
(VALUES
  ('Замена термопасты', 2000),
  ('Ремонт материнской платы', 15000),
  ('Замена матрицы', 11000),
  ('Чистка системы охлаждения', 2500)
) AS v(name, price)
WHERE c.name = 'Asus'
ON CONFLICT DO NOTHING;

-- Услуги Другое
INSERT INTO categories (name, parent_id, level, base_price)
SELECT v.name, c.id, 1, v.price FROM categories c,
(VALUES
  ('Консультация', 500),
  ('Диагностика', 1000),
  ('Ремонт любой сложности', 3000),
  ('Профилактика', 2000)
) AS v(name, price)
WHERE c.name = 'Другое' AND c.parent_id IS NULL
ON CONFLICT DO NOTHING;

-- =====================================================
-- Временные слоты — генерируем на ближайшие 30 дней
-- =====================================================
INSERT INTO time_slots (slot_date, slot_time, is_booked)
SELECT
  CURRENT_DATE + s.day,
  t.slot_time,
  false
FROM generate_series(1, 30) AS s(day)
CROSS JOIN (
  VALUES
    ('10:00'::time), ('11:00'::time), ('12:00'::time),
    ('14:00'::time), ('15:00'::time), ('16:00'::time)
) AS t(slot_time)
WHERE EXTRACT(DOW FROM CURRENT_DATE + s.day) NOT IN (0, 6) -- пропускаем выходные
ON CONFLICT (slot_date, slot_time) DO NOTHING;

-- =====================================================
-- Тестовые пользователи (пароль: Test1234)
-- =====================================================
INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES
('client1@test.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Александр', 'Петров',  '+79001234567'),
('client2@test.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Мария',     'Иванова', '+79007654321'),
('client3@test.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Дмитрий',   'Сидоров', '+79009876543')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email IN ('client1@test.ru', 'client2@test.ru', 'client3@test.ru')
  AND r.name = 'client'
ON CONFLICT DO NOTHING;

-- =====================================================
-- Тестовые заказы
-- =====================================================
INSERT INTO orders (user_id, category_id, problem_description, final_price, appointment_date, appointment_time, is_custom_device)
SELECT u.id, c.id, 'Разбил экран, нужна замена стекла', 2500, CURRENT_DATE - 26, '10:00', false
FROM users u, categories c
WHERE u.email = 'client2@test.ru' AND c.name = 'Замена стекла' AND EXISTS (
  SELECT 1 FROM categories p WHERE p.id = c.parent_id AND p.name = 'Apple'
)
AND NOT EXISTS (SELECT 1 FROM orders WHERE user_id = u.id AND problem_description = 'Разбил экран, нужна замена стекла');

INSERT INTO orders (user_id, category_id, problem_description, final_price, appointment_date, appointment_time, is_custom_device)
SELECT u.id, c.id, 'Телефон не заряжается', 2800, CURRENT_DATE - 24, '12:00', false
FROM users u, categories c
WHERE u.email = 'client2@test.ru' AND c.name = 'Ремонт разъёма зарядки' AND EXISTS (
  SELECT 1 FROM categories p WHERE p.id = c.parent_id AND p.name = 'Apple'
)
AND NOT EXISTS (SELECT 1 FROM orders WHERE user_id = u.id AND problem_description = 'Телефон не заряжается');

INSERT INTO orders (user_id, category_id, problem_description, final_price, appointment_date, appointment_time, is_custom_device)
SELECT u.id, c.id, 'Ноутбук перегревается и выключается', 2500, CURRENT_DATE - 21, '14:00', false
FROM users u, categories c
WHERE u.email = 'client3@test.ru' AND c.name = 'Чистка системы охлаждения' AND EXISTS (
  SELECT 1 FROM categories p WHERE p.id = c.parent_id AND p.name = 'Lenovo'
)
AND NOT EXISTS (SELECT 1 FROM orders WHERE user_id = u.id AND problem_description = 'Ноутбук перегревается и выключается');

-- =====================================================
-- Статусы заказов
-- =====================================================
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT o.id, s.id, o.user_id, o.created_at
FROM orders o, statuses s
WHERE s.name = 'Новая'
  AND NOT EXISTS (
    SELECT 1 FROM order_status_history h WHERE h.order_id = o.id AND h.status_id = s.id
  );

-- =====================================================
-- Отзыв для первого завершённого заказа
-- =====================================================
INSERT INTO reviews (order_id, user_id, rating, comment)
SELECT o.id, o.user_id, 5, 'Отличный сервис! Заменили стекло за 2 часа, всё аккуратно.'
FROM orders o
WHERE o.problem_description = 'Разбил экран, нужна замена стекла'
  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.order_id = o.id);