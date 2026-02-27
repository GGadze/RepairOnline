-- =====================================================
-- Ремонт-Онлайн: Схема базы данных
-- Миграция 001 — начальная
-- =====================================================

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50),
    phone         VARCHAR(20)  NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Роли
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(200)
);

-- Связь пользователей и ролей
CREATE TABLE IF NOT EXISTS user_roles (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- Иерархический каталог техники
CREATE TABLE IF NOT EXISTS categories (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100)    NOT NULL,
    parent_id  INT             REFERENCES categories(id) ON DELETE SET NULL,
    level      INT             NOT NULL DEFAULT 0,
    base_price DECIMAL(10, 2)  NOT NULL DEFAULT 0,
    created_at TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Справочник статусов заказа
CREATE TABLE IF NOT EXISTS statuses (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(200),
    color_code  VARCHAR(7)
);

-- Временные слоты для бронирования
CREATE TABLE IF NOT EXISTS time_slots (
    id         SERIAL PRIMARY KEY,
    slot_date  DATE      NOT NULL,
    slot_time  TIME      NOT NULL,
    is_booked  BOOLEAN   NOT NULL DEFAULT FALSE,
    order_id   INT       UNIQUE REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(slot_date, slot_time)
);

-- Заказы (центральная таблица)
CREATE TABLE IF NOT EXISTS orders (
    id                  SERIAL PRIMARY KEY,
    user_id             INT            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id         INT            REFERENCES categories(id) ON DELETE SET NULL,
    custom_device_name  VARCHAR(200),
    problem_description TEXT           NOT NULL,
    final_price         DECIMAL(10, 2),
    appointment_date    DATE           NOT NULL,
    appointment_time    TIME           NOT NULL,
    is_custom_device    BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- История изменений статусов
CREATE TABLE IF NOT EXISTS order_status_history (
    id         SERIAL PRIMARY KEY,
    order_id   INT       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status_id  INT       NOT NULL REFERENCES statuses(id),
    changed_by INT       NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Фотографии поломок
CREATE TABLE IF NOT EXISTS photos (
    id          SERIAL PRIMARY KEY,
    order_id    INT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    file_path   VARCHAR(255) NOT NULL,
    file_name   VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Отзывы (один заказ = один отзыв)
CREATE TABLE IF NOT EXISTS reviews (
    id         SERIAL PRIMARY KEY,
    order_id   INT       NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    user_id    INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating     INT       NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Начальные данные
-- =====================================================

INSERT INTO roles (name, description) VALUES
    ('client', 'Клиент сервиса'),
    ('admin',  'Администратор / Мастер')
ON CONFLICT (name) DO NOTHING;

INSERT INTO statuses (name, description, color_code) VALUES
    ('Новая',              'Заявка только что создана',               '#3B82F6'),
    ('Принята',            'Мастер принял заявку в работу',           '#8B5CF6'),
    ('В процессе',         'Устройство находится на ремонте',         '#F59E0B'),
    ('Ожидание запчастей', 'Ожидаем поступления необходимых деталей', '#F97316'),
    ('Готово',             'Ремонт завершён, можно забирать',         '#10B981'),
    ('Выдан',              'Устройство выдано клиенту',               '#6B7280'),
    ('Отменён',            'Заявка отменена',                         '#EF4444')
ON CONFLICT (name) DO NOTHING;
