import { defineParams } from '@sveltejs/kit/params';

/**
 * Ограничивает параметр [mode] маршрута /auth допустимыми значениями:
 * 'sign-in' (вход), 'sign-up' (регистрация), 'device' (вход по QR, device-flow).
 * @param {string} value
 * @returns {value is ('sign-in' | 'sign-up' | 'device')}
 */
function matchAuthMode(value) {
  return value === 'sign-in' || value === 'sign-up' || value === 'device';
}

export const params = defineParams({
	authMode: (param) => (matchAuthMode(param) ? param : undefined)
});
