/**
 * Чистые функции для работы с JWT (без состояния).
 */

/**
 * Декодирует payload JWT-токена в объект.
 * @param {string} token
 * @returns {object}
 */
export function parseJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+')
      .replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
      window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
  );

  return JSON.parse(jsonPayload);
}