/**
 * Единая карта маршрутов приложения. Чистые данные без зависимостей от Svelte —
 * импортируется из сервисов, компонентов и тестов. Убирает захардкоженные пути.
 */
export const ROUTES = {
  serversList: '/servers',
  serversMap: (serverId) => `/servers/${serverId}/map`,
  serversChat: (serverId) => `/servers/${serverId}/chat`,
  serversConsole: (serverId) => `/servers/${serverId}/console`,
  serversControl: (id) => `/servers/${id}/control`,
  serversBids: '/servers/bids',

  signIn: '/auth/sign-in',
  // Параметризованный маршрут авторизации: '/auth/sign-in' | '/auth/sign-up'.
  auth: (mode) => `/auth/${mode}`,
  // Вход устройства приложения без пароля (device-flow, запрашивающая сторона).
  authDevice: '/auth/device',

  // Профиль; принимает ?userCode=... для подтверждения входа стороннего устройства (DCF).
  profile: '/profile',

  home: '/',
};
