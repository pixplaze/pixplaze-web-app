/**
 * ISO-строка с сервера (без суффикса и с микросекундами) → читаемая локальная дата.
 * Обрезаем до миллисекунд и добавляем Z — бэкенд отдаёт UTC без суффикса.
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const normalized = isoString.slice(0, 23) + 'Z';
  return new Date(normalized).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export const formatNumber = number => {
  const n = number / 1000;
  if (n > 1) {
    return Math.trunc(n) + 'K';
  }

  return number;
}
