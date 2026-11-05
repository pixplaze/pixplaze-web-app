/**
 * ISO-строка с сервера (без суффикса и с микросекундами) → читаемая локальная дата.
 * Обрезаем до миллисекунд и добавляем Z — бэкенд отдаёт UTC без суффикса.
 */
export function formatDate(date) {
  if (!date) return '';

  if (typeof date === 'number' || !isNaN(date)) {
    return new Date(Number(date)).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  if (typeof date === 'string' && date.includes('T')) {
    const normalized = date.slice(0, 23) + 'Z';
    return new Date(normalized).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  throw new Error('No format for date: ' + date);
}

export const formatNumber = number => {
  const n = number / 1000;
  if (n > 1) {
    return Math.trunc(n) + 'K';
  }

  return number;
}
