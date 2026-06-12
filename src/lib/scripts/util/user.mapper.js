import {parseJwt} from "$lib/scripts/util/jwt.util.js";
import {parse} from "$lib/scripts/util/authority.util.js";

/**
 * Чистая функция: access-токен → объект пользователя.
 * Без рун и без зависимости от стора — тестируется в голом Node.
 *
 * @param {string} token access-токен JWT
 * @returns {{name: string, email: string, authority: *} | null} пользователь или null,
 *          если токена нет либо он битый/непарсируемый.
 */
export function buildUserFromToken(token) {
  if (!token) return null;
  try {
    const jwt = parseJwt(token);
    return {name: jwt.sub, email: jwt.email, authority: parse(jwt)};
  } catch {
    return null;
  }
}