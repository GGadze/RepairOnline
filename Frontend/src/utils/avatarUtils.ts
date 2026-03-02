// Маппинг avatar_id → эмодзи
// Используется на всех страницах для отображения аватара пользователя
export const AVATAR_MAP: Record<number, string> = {
  1: '👤',
  2: '👨‍💼',
  3: '👩‍💼',
  4: '🧑‍🔧',
  5: '👨‍💻',
  6: '👩‍💻',
  7: '🧑‍🎓',
  8: '👮',
  9: '🧑‍⚕️',
  10: '🕵️',
};

/**
 * Получить эмодзи аватара по ID.
 * Если ID не найден — возвращает дефолтный 👤
 */
export function getAvatarEmoji(avatarId: number | null | undefined): string {
  if (!avatarId) return '👤';
  return AVATAR_MAP[avatarId] || '👤';
}