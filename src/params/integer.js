/**
 * Параметр маршрута — положительное целое (id сущности), например /servers/[id=integer].
 * @param {string} value
 * @returns {boolean}
 */
export function match(value) {
  return /^[1-9]\d*$/.test(value);
}
