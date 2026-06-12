/**
 * Ограничивает параметр [mode] маршрута /auth допустимыми значениями.
 * /auth/sign-in и /auth/sign-up совпадают, остальное — нет.
 * @param {string} value
 * @returns {value is ('sign-in' | 'sign-up')}
 */
export function match(value) {
  return value === 'sign-in' || value === 'sign-up';
}