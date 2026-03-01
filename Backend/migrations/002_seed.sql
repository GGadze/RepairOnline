-- =====================================================
-- Тестовые данные для Ремонт-Онлайн
-- =====================================================

-- Категории (иерархия: Тип → Бренд → Услуга)
INSERT INTO categories (name, parent_id, level, base_price) VALUES
-- Уровень 0 — типы устройств
('Смартфоны',       NULL, 0, 0),
('Ноутбуки',        NULL, 0, 0),
('Планшеты',        NULL, 0, 0),
('Телевизоры',      NULL, 0, 0),
('Бытовая техника', NULL, 0, 0),
('Другое',          NULL, 0, 0);

-- Уровень 1 — бренды (parent = Смартфоны = 1)
INSERT INTO categories (name, parent_id, level, base_price) VALUES
('Apple',   1, 1, 0),
('Samsung', 1, 1, 0),
('Xiaomi',  1, 1, 0);

-- Уровень 1 — бренды ноутбуков (parent = Ноутбуки = 2)
INSERT INTO categories (name, parent_id, level, base_price) VALUES
('Lenovo', 2, 1, 0),
('Asus',   2, 1, 0),
('HP',     2, 1, 0);

-- Уровень 2 — услуги для Apple (parent = Apple = 7)
INSERT INTO categories (name, parent_id, level, base_price) VALUES
('Замена стекла',              7, 2, 2500),
('Замена аккумулятора',        7, 2, 4500),
('Замена дисплея',             7, 2, 9000),
('Ремонт разъёма зарядки',     7, 2, 2800),
('Восстановление после воды',  7, 2, 6500);

-- Уровень 2 — услуги для Samsung (parent = Samsung = 8)
INSERT INTO categories (name, parent_id, level, base_price) VALUES
('Замена стекла',              8, 2, 1800),
('Замена аккумулятора',        8, 2, 3500),
('Замена дисплея',             8, 2, 7500),
('Ремонт разъёма зарядки',     8, 2, 2200),
('Чистка от пыли',             8, 2, 1200);

-- Уровень 2 — услуги для Xiaomi (parent = Xiaomi = 9)
INSERT INTO categories (name, parent_id, level, base_price) VALUES
('Замена стекла',              9, 2, 1500),
('Замена аккумулятора',        9, 2, 2800),
('Замена дисплея',             9, 2, 5500),
('Ремонт кнопок',              9, 2, 1800);

-- Уровень 2 — услуги для Lenovo (parent = Lenovo = 10)
INSERT INTO categories (name, parent_id, level, base_price) VALUES
('Замена термопасты',           10, 2, 2000),
('Замена клавиатуры',           10, 2, 3500),
('Чистка системы охлаждения',   10, 2, 2500),
('Замена матрицы',              10, 2, 12000),
('Замена аккумулятора',         10, 2, 7000);

-- Уровень 2 — услуги для Asus (parent = Asus = 11)
INSERT INTO categories (name, parent_id, level, base_price) VALUES
('Замена термопасты',           11, 2, 2000),
('Ремонт материнской платы',    11, 2, 15000),
('Замена матрицы',              11, 2, 11000),
('Чистка системы охлаждения',   11, 2, 2500);

-- Услуги для Другое (parent = Другое = 6)
INSERT INTO categories (name, parent_id, level, base_price) VALUES
('Консультация',            6, 1, 500),
('Диагностика',             6, 1, 1000),
('Ремонт любой сложности',  6, 1, 3000),
('Профилактика',            6, 1, 2000);

-- =====================================================
-- Временные слоты на ближайшие дни
-- =====================================================
INSERT INTO time_slots (slot_date, slot_time, is_booked) VALUES
('2026-03-03', '10:00', false),
('2026-03-03', '11:00', false),
('2026-03-03', '12:00', false),
('2026-03-03', '14:00', false),
('2026-03-03', '15:00', false),
('2026-03-03', '16:00', false),

('2026-03-04', '10:00', false),
('2026-03-04', '11:00', false),
('2026-03-04', '12:00', false),
('2026-03-04', '14:00', false),
('2026-03-04', '15:00', false),
('2026-03-04', '16:00', false),
('2026-03-04', '17:00', false),

('2026-03-05', '10:00', false),
('2026-03-05', '11:00', false),
('2026-03-05', '13:00', false),
('2026-03-05', '14:00', false),
('2026-03-05', '16:00', false),

('2026-03-06', '10:00', false),
('2026-03-06', '11:00', false),
('2026-03-06', '12:00', false),
('2026-03-06', '14:00', false),
('2026-03-06', '15:00', false),

('2026-03-07', '10:00', false),
('2026-03-07', '12:00', false),
('2026-03-07', '14:00', false),
('2026-03-07', '16:00', false),

('2026-03-10', '10:00', false),
('2026-03-10', '11:00', false),
('2026-03-10', '13:00', false),
('2026-03-10', '15:00', false),
('2026-03-10', '17:00', false),

('2026-03-11', '10:00', false),
('2026-03-11', '11:00', false),
('2026-03-11', '12:00', false),
('2026-03-11', '14:00', false),
('2026-03-11', '16:00', false),

('2026-03-12', '10:00', false),
('2026-03-12', '11:00', false),
('2026-03-12', '14:00', false),
('2026-03-12', '15:00', false),
('2026-03-12', '17:00', false);

-- =====================================================
-- Тестовые пользователи (пароль для всех: Test1234)
-- $2a$10$ — bcrypt хэш строки "Test1234"
-- =====================================================
INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES
('client1@test.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Александр', 'Петров',   '+79001234567'),
('client2@test.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Мария',     'Иванова',   '+79007654321'),
('client3@test.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Дмитрий',   'Сидоров',   '+79009876543');

-- Роли для тестовых пользователей (client)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email IN ('client1@test.ru', 'client2@test.ru', 'client3@test.ru')
  AND r.name = 'client';

-- =====================================================
-- Тестовые заказы
-- =====================================================
INSERT INTO orders (user_id, category_id, problem_description, final_price, appointment_date, appointment_time, is_custom_device) VALUES
(2, 13, 'Разбил экран, нужна замена стекла',         2500,  '2026-02-20', '10:00', false),
(2, 15, 'Телефон не заряжается',                     2800,  '2026-02-22', '12:00', false),
(3, 26, 'Ноутбук перегревается и выключается',       2500,  '2026-02-25', '14:00', false),
(3, 14, 'Аккумулятор держит 1 час',                  4500,  '2026-02-26', '11:00', false),
(2, 17, 'Телефон упал в воду, не включается',        6500,  '2026-02-28', '15:00', false);

-- Пометим слоты как занятые для этих заказов
UPDATE time_slots SET is_booked = true, order_id = (SELECT id FROM orders LIMIT 1 OFFSET 0)
WHERE slot_date = '2026-02-20' AND slot_time = '10:00:00';

-- =====================================================
-- История статусов для заказов
-- =====================================================

-- Заказ 1 — Выдан (полный цикл)
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 1, id, 2, '2026-02-20 10:00:00' FROM statuses WHERE name = 'Новая';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 1, id, 2, '2026-02-20 11:00:00' FROM statuses WHERE name = 'Принята';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 1, id, 2, '2026-02-20 14:00:00' FROM statuses WHERE name = 'В процессе';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 1, id, 2, '2026-02-21 10:00:00' FROM statuses WHERE name = 'Готово';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 1, id, 2, '2026-02-21 15:00:00' FROM statuses WHERE name = 'Выдан';

-- Заказ 2 — Готово
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 2, id, 3, '2026-02-22 12:00:00' FROM statuses WHERE name = 'Новая';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 2, id, 3, '2026-02-22 13:00:00' FROM statuses WHERE name = 'Принята';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 2, id, 3, '2026-02-23 10:00:00' FROM statuses WHERE name = 'В процессе';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 2, id, 3, '2026-02-23 16:00:00' FROM statuses WHERE name = 'Готово';

-- Заказ 3 — В процессе
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 3, id, 4, '2026-02-25 14:00:00' FROM statuses WHERE name = 'Новая';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 3, id, 4, '2026-02-25 15:00:00' FROM statuses WHERE name = 'Принята';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 3, id, 4, '2026-02-26 09:00:00' FROM statuses WHERE name = 'В процессе';

-- Заказ 4 — Ожидание запчастей
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 4, id, 4, '2026-02-26 11:00:00' FROM statuses WHERE name = 'Новая';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 4, id, 4, '2026-02-26 12:00:00' FROM statuses WHERE name = 'Принята';
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 4, id, 4, '2026-02-27 10:00:00' FROM statuses WHERE name = 'Ожидание запчастей';

-- Заказ 5 — Новая
INSERT INTO order_status_history (order_id, status_id, changed_by, changed_at)
SELECT 5, id, 3, '2026-02-28 15:00:00' FROM statuses WHERE name = 'Новая';

-- =====================================================
-- Отзывы (только для завершённых заказов 1)
-- =====================================================
INSERT INTO reviews (order_id, user_id, rating, comment) VALUES
(1, 2, 5, 'Отличный сервис! Заменили стекло за 2 часа, всё аккуратно. Цена приятно удивила. Рекомендую!');
