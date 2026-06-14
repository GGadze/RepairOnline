-- Migration 009: полный каталог услуг (дополнение)
-- Наполняет услугами все ветки каталога. Идемпотентно (NOT EXISTS).
-- Сгенерировано автоматически.

-- Исправляем уровень подкатегорий Автомобилей (003 не проставила level=1)
UPDATE categories SET level = 1
WHERE parent_id = (SELECT id FROM categories WHERE name = 'Автомобили' AND parent_id IS NULL)
  AND level = 0;


-- ───────── Смартфоны ─────────
-- Смартфоны / Honor
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Honor', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Honor');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена защитного стекла', l1.id, 2, 1300 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Honor' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена защитного стекла');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена дисплейного модуля', l1.id, 2, 5500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Honor' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена дисплейного модуля');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 2600 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Honor' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт разъёма зарядки', l1.id, 2, 2100 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Honor' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт разъёма зарядки');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Восстановление после воды', l1.id, 2, 5000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Honor' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Восстановление после воды');
-- Смартфоны / Realme
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Realme', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Realme');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена защитного стекла', l1.id, 2, 1300 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Realme' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена защитного стекла');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена дисплейного модуля', l1.id, 2, 5200 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Realme' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена дисплейного модуля');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 2500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Realme' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт разъёма зарядки', l1.id, 2, 2000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Realme' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт разъёма зарядки');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Восстановление после воды', l1.id, 2, 5000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Realme' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Восстановление после воды');
-- Смартфоны / Tecno
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Tecno', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Tecno');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена защитного стекла', l1.id, 2, 1100 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Tecno' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена защитного стекла');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена дисплейного модуля', l1.id, 2, 4500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Tecno' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена дисплейного модуля');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 2200 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Tecno' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт разъёма зарядки', l1.id, 2, 1900 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Tecno' AND l0.name = 'Смартфоны' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт разъёма зарядки');

-- ───────── Ноутбуки ─────────
-- Ноутбуки / HP
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'HP', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'HP');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена термопасты', l1.id, 2, 2000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'HP' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена термопасты');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Чистка системы охлаждения', l1.id, 2, 2400 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'HP' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Чистка системы охлаждения');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена клавиатуры', l1.id, 2, 3200 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'HP' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена клавиатуры');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена матрицы', l1.id, 2, 10000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'HP' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена матрицы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 6500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'HP' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт цепи питания', l1.id, 2, 5000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'HP' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт цепи питания');
-- Ноутбуки / Acer
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Acer', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Acer');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена термопасты', l1.id, 2, 2000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Acer' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена термопасты');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Чистка системы охлаждения', l1.id, 2, 2400 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Acer' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Чистка системы охлаждения');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена клавиатуры', l1.id, 2, 3000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Acer' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена клавиатуры');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена матрицы', l1.id, 2, 9500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Acer' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена матрицы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 6000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Acer' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
-- Ноутбуки / MSI
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'MSI', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'MSI');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена термопасты', l1.id, 2, 2500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MSI' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена термопасты');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Чистка системы охлаждения', l1.id, 2, 2800 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MSI' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Чистка системы охлаждения');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена матрицы', l1.id, 2, 13000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MSI' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена матрицы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт материнской платы', l1.id, 2, 16000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MSI' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт материнской платы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 7500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MSI' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
-- Ноутбуки / MacBook
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'MacBook', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'MacBook');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена термопасты', l1.id, 2, 3000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MacBook' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена термопасты');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Чистка системы охлаждения', l1.id, 2, 3200 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MacBook' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Чистка системы охлаждения');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена клавиатуры (топкейс)', l1.id, 2, 12000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MacBook' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена клавиатуры (топкейс)');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена матрицы', l1.id, 2, 22000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MacBook' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена матрицы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 9000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MacBook' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Восстановление после воды', l1.id, 2, 8000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'MacBook' AND l0.name = 'Ноутбуки' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Восстановление после воды');

-- ───────── Планшеты ─────────
-- Планшеты / Apple iPad
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Apple iPad', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Apple iPad');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена защитного стекла', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Apple iPad' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена защитного стекла');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена дисплейного модуля', l1.id, 2, 9000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Apple iPad' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена дисплейного модуля');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 4500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Apple iPad' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт разъёма зарядки', l1.id, 2, 2800 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Apple iPad' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт разъёма зарядки');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Восстановление после воды', l1.id, 2, 6500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Apple iPad' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Восстановление после воды');
-- Планшеты / Samsung Galaxy Tab
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Samsung Galaxy Tab', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Samsung Galaxy Tab');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена защитного стекла', l1.id, 2, 2800 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung Galaxy Tab' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена защитного стекла');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена дисплейного модуля', l1.id, 2, 7000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung Galaxy Tab' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена дисплейного модуля');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung Galaxy Tab' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт разъёма зарядки', l1.id, 2, 2400 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung Galaxy Tab' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт разъёма зарядки');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Восстановление после воды', l1.id, 2, 5500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung Galaxy Tab' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Восстановление после воды');
-- Планшеты / Huawei MatePad
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Huawei MatePad', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Huawei MatePad');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена защитного стекла', l1.id, 2, 2500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Huawei MatePad' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена защитного стекла');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена дисплейного модуля', l1.id, 2, 6000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Huawei MatePad' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена дисплейного модуля');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 3200 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Huawei MatePad' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт разъёма зарядки', l1.id, 2, 2200 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Huawei MatePad' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт разъёма зарядки');
-- Планшеты / Lenovo Tab
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Lenovo Tab', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Lenovo Tab');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена защитного стекла', l1.id, 2, 2200 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Lenovo Tab' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена защитного стекла');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена дисплейного модуля', l1.id, 2, 5000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Lenovo Tab' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена дисплейного модуля');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 3000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Lenovo Tab' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт разъёма зарядки', l1.id, 2, 2000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Lenovo Tab' AND l0.name = 'Планшеты' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт разъёма зарядки');

-- ───────── Телевизоры ─────────
-- Телевизоры / Samsung
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Samsung', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Samsung');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена матрицы', l1.id, 2, 18000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена матрицы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт LED-подсветки', l1.id, 2, 4500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт LED-подсветки');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена блока питания', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена блока питания');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт основной платы', l1.id, 2, 4000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт основной платы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена шлейфа матрицы', l1.id, 2, 2500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена шлейфа матрицы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Настройка и прошивка', l1.id, 2, 1500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Samsung' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Настройка и прошивка');
-- Телевизоры / LG
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'LG', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'LG');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена матрицы', l1.id, 2, 17000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'LG' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена матрицы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт LED-подсветки', l1.id, 2, 4500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'LG' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт LED-подсветки');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена блока питания', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'LG' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена блока питания');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт основной платы', l1.id, 2, 4000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'LG' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт основной платы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Настройка и прошивка', l1.id, 2, 1500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'LG' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Настройка и прошивка');
-- Телевизоры / Sony
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Sony', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Sony');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена матрицы', l1.id, 2, 20000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Sony' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена матрицы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт LED-подсветки', l1.id, 2, 5000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Sony' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт LED-подсветки');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена блока питания', l1.id, 2, 4000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Sony' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена блока питания');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт основной платы', l1.id, 2, 4500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Sony' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт основной платы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Настройка и прошивка', l1.id, 2, 1800 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Sony' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Настройка и прошивка');
-- Телевизоры / Xiaomi
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Xiaomi', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Xiaomi');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена матрицы', l1.id, 2, 14000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Xiaomi' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена матрицы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт LED-подсветки', l1.id, 2, 4000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Xiaomi' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт LED-подсветки');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена блока питания', l1.id, 2, 3000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Xiaomi' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена блока питания');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт основной платы', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Xiaomi' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт основной платы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Настройка и прошивка', l1.id, 2, 1200 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Xiaomi' AND l0.name = 'Телевизоры' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Настройка и прошивка');

-- ───────── Бытовая техника ─────────
-- Бытовая техника / Стиральные машины
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Стиральные машины', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Стиральные машины');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена подшипников барабана', l1.id, 2, 5500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Стиральные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена подшипников барабана');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена ТЭНа', l1.id, 2, 2800 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Стиральные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена ТЭНа');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена сливного насоса', l1.id, 2, 2500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Стиральные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена сливного насоса');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт модуля управления', l1.id, 2, 4500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Стиральные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт модуля управления');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена амортизаторов', l1.id, 2, 2200 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Стиральные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена амортизаторов');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Диагностика', l1.id, 2, 800 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Стиральные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Диагностика');
-- Бытовая техника / Холодильники
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Холодильники', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Холодильники');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Заправка фреоном', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Холодильники' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Заправка фреоном');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена компрессора', l1.id, 2, 7500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Холодильники' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена компрессора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена термостата', l1.id, 2, 2500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Холодильники' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена термостата');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт платы управления', l1.id, 2, 4000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Холодильники' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт платы управления');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена уплотнителя двери', l1.id, 2, 2000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Холодильники' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена уплотнителя двери');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Диагностика', l1.id, 2, 800 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Холодильники' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Диагностика');
-- Бытовая техника / Микроволновые печи
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Микроволновые печи', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Микроволновые печи');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена магнетрона', l1.id, 2, 3000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Микроволновые печи' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена магнетрона');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена слюдяной пластины', l1.id, 2, 900 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Микроволновые печи' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена слюдяной пластины');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт платы управления', l1.id, 2, 2500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Микроволновые печи' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт платы управления');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена кнопок/панели', l1.id, 2, 1800 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Микроволновые печи' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена кнопок/панели');
-- Бытовая техника / Пылесосы
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Пылесосы', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Пылесосы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена двигателя', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Пылесосы' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена двигателя');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Чистка и обслуживание', l1.id, 2, 1200 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Пылесосы' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Чистка и обслуживание');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена шланга', l1.id, 2, 1500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Пылесосы' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена шланга');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт кнопки включения', l1.id, 2, 1000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Пылесосы' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт кнопки включения');
-- Бытовая техника / Посудомоечные машины
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Посудомоечные машины', l0.id, 1, 0 FROM categories l0
WHERE l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l0.id AND x.name = 'Посудомоечные машины');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена ТЭНа', l1.id, 2, 3000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Посудомоечные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена ТЭНа');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена циркуляционного насоса', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Посудомоечные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена циркуляционного насоса');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Чистка фильтров и форсунок', l1.id, 2, 1500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Посудомоечные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Чистка фильтров и форсунок');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт модуля управления', l1.id, 2, 4500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Посудомоечные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт модуля управления');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Диагностика', l1.id, 2, 800 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Посудомоечные машины' AND l0.name = 'Бытовая техника' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Диагностика');

-- ───────── Автомобили (услуги под существующие подкатегории) ─────────
-- Автомобили / Двигатель и трансмиссия
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена ремня ГРМ', l1.id, 2, 4500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Двигатель и трансмиссия' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена ремня ГРМ');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт ГБЦ', l1.id, 2, 12000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Двигатель и трансмиссия' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт ГБЦ');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена сцепления', l1.id, 2, 8000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Двигатель и трансмиссия' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена сцепления');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена масла и фильтров', l1.id, 2, 2000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Двигатель и трансмиссия' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена масла и фильтров');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Диагностика двигателя', l1.id, 2, 1500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Двигатель и трансмиссия' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Диагностика двигателя');
-- Автомобили / Ходовая часть
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена амортизаторов', l1.id, 2, 4000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Ходовая часть' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена амортизаторов');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена ступичных подшипников', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Ходовая часть' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена ступичных подшипников');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена шаровых опор', l1.id, 2, 2500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Ходовая часть' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена шаровых опор');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Развал-схождение', l1.id, 2, 2000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Ходовая часть' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Развал-схождение');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена сайлентблоков', l1.id, 2, 3000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Ходовая часть' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена сайлентблоков');
-- Автомобили / Электрооборудование
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Компьютерная диагностика', l1.id, 2, 1500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Электрооборудование' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Компьютерная диагностика');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена генератора', l1.id, 2, 4500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Электрооборудование' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена генератора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена стартера', l1.id, 2, 4000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Электрооборудование' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена стартера');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт проводки', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Электрооборудование' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт проводки');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена аккумулятора', l1.id, 2, 1500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Электрооборудование' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена аккумулятора');
-- Автомобили / Тормозная система
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена тормозных колодок', l1.id, 2, 1800 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Тормозная система' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена тормозных колодок');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена тормозных дисков', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Тормозная система' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена тормозных дисков');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Прокачка тормозной системы', l1.id, 2, 1500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Тормозная система' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Прокачка тормозной системы');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена суппорта', l1.id, 2, 4000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Тормозная система' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена суппорта');
-- Автомобили / Кондиционер и печка
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Заправка кондиционера', l1.id, 2, 2500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Кондиционер и печка' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Заправка кондиционера');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт компрессора кондиционера', l1.id, 2, 6000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Кондиционер и печка' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт компрессора кондиционера');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена радиатора печки', l1.id, 2, 4500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Кондиционер и печка' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена радиатора печки');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Чистка системы кондиционирования', l1.id, 2, 2000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Кондиционер и печка' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Чистка системы кондиционирования');
-- Автомобили / Выхлопная система
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Замена глушителя', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Выхлопная система' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Замена глушителя');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Ремонт катализатора', l1.id, 2, 6000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Выхлопная система' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Ремонт катализатора');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Сварка выхлопной системы', l1.id, 2, 2000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Выхлопная система' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Сварка выхлопной системы');
-- Автомобили / Кузовные работы
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Покраска элемента кузова', l1.id, 2, 6000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Кузовные работы' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Покраска элемента кузова');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Удаление вмятин без покраски', l1.id, 2, 3000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Кузовные работы' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Удаление вмятин без покраски');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Полировка кузова', l1.id, 2, 3500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Кузовные работы' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Полировка кузова');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Антикоррозийная обработка', l1.id, 2, 4000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Кузовные работы' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Антикоррозийная обработка');
-- Автомобили / Другое
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Консультация', l1.id, 2, 500 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Другое' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Консультация');
INSERT INTO categories (name, parent_id, level, base_price)
SELECT 'Комплексная диагностика', l1.id, 2, 2000 FROM categories l1
JOIN categories l0 ON l1.parent_id = l0.id
WHERE l1.name = 'Другое' AND l0.name = 'Автомобили' AND l0.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM categories x WHERE x.parent_id = l1.id AND x.name = 'Комплексная диагностика');
