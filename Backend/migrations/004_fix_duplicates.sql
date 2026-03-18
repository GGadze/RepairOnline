-- Migration 004: удаление дублей категорий
-- Оставляем запись с наименьшим id для каждой пары (name, parent_id)

-- 1. Удаляем дочерние категории дублей (сначала потомков)
DELETE FROM categories
WHERE id NOT IN (
  SELECT MIN(id)
  FROM categories
  GROUP BY name, COALESCE(parent_id, -1)
)
AND parent_id IS NOT NULL;

-- 2. Удаляем дубли корневых категорий
DELETE FROM categories
WHERE id NOT IN (
  SELECT MIN(id)
  FROM categories
  GROUP BY name, COALESCE(parent_id, -1)
)
AND parent_id IS NULL;