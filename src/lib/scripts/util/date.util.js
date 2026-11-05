/**
 * Возвращает объект Date, очищенный от времени (00:00:00.000).
 * Используется как хелпер для точного сравнения дней по календарю.
 */
export const FORMATTER_INSTANT = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

export const FORMATTER_WEEK_DAY_HM = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short', // Короткое название (пн, вт, ср...)
  hour: '2-digit',   // Две цифры для часов (02)
  minute: '2-digit', // Две цифры для минут (40)
  hour12: false      // 24-часовой формат
});

function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Менее 1 минуты назад (на основе таймстемпов)
 */
function isJustNow(date, now) {
  // Проверяем, что событие в прошлом, но разница меньше 60 000 мс (1 минута)
  const diff = now.getTime() - date.getTime();
  return diff >= 0 && diff <= 60000;
}

/**
 * Сегодня (сравнение календарных дней)
 */
function isToday(date, now) {
  return date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
}

/**
 * Вчера (ровно 1 календарный день назад от 'now')
 */
function isYesterday(date, now) {
  const startOfLogDay = getStartOfDay(date).getTime();
  const startOfToday = getStartOfDay(now).getTime();
  const oneDayInMs = 24 * 60 * 60 * 1000;

  return startOfToday - startOfLogDay === oneDayInMs;
}

/**
 * Позавчера (ровно 2 календарных дня назад от 'now')
 */
function isDayBeforeYesterday(date, now) {
  const startOfLogDay = getStartOfDay(date).getTime();
  const startOfToday = getStartOfDay(now).getTime();
  const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

  return startOfToday - startOfLogDay === twoDaysInMs;
}

function getInstantLabel(date, now) {
  if (isJustNow(date, now)) {
    return 'только что';
  } else if (isToday(date, now)) {
    return 'сегодня';
  } else if (isYesterday(date, now)) {
    return 'вчера';
  } else if (isDayBeforeYesterday(date, now)) {
    return 'позавчера';
  } else {
    return FORMATTER_INSTANT.format(date);
  }
}

// export default {FORMATTER_INSTANT, FORMATTER_WEEK_DAY_HM}