-- Migration 003: категория "Автомобили" и подкатегории
DO $$
DECLARE
  auto_id INT;
BEGIN
  INSERT INTO categories (name, parent_id, base_price)
  VALUES ('Автомобили', NULL, 0)
  ON CONFLICT DO NOTHING;

  SELECT id INTO auto_id
  FROM categories
  WHERE name = 'Автомобили' AND parent_id IS NULL;

  IF auto_id IS NOT NULL THEN
    INSERT INTO categories (name, parent_id, base_price) VALUES
      ('Двигатель и трансмиссия', auto_id, 0),
      ('Ходовая часть',           auto_id, 0),
      ('Электрооборудование',     auto_id, 0),
      ('Тормозная система',       auto_id, 0),
      ('Кондиционер и печка',     auto_id, 0),
      ('Выхлопная система',       auto_id, 0),
      ('Кузовные работы',         auto_id, 0),
      ('Диагностика',             auto_id, 1500),
      ('Замена масла и фильтров', auto_id, 2000),
      ('Другое',                  auto_id, 0)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;