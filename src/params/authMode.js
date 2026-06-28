/**
 * Ограничивает параметр [mode] маршрута /auth допустимыми значениями:
 * 'sign-in' (вход), 'sign-up' (регистрация), 'device' (вход по QR, device-flow).
 * @param {string} value
 * @returns {value is ('sign-in' | 'sign-up' | 'device')}
 */
export function match(value) {
  return value === 'sign-in' || value === 'sign-up' || value === 'device';
}