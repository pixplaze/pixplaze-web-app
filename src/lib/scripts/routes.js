/**
 * Единая карта маршрутов приложения. Чистые данные без зависимостей от Svelte —
 * импортируется из сервисов, компонентов и тестов. Убирает захардкоженные пути.
 */
export const ROUTES = {
  serversConsole: '/servers/console',
  serversMap: '/servers/map',
  serversList: '/servers/list',
  serversChat: '/servers/chat',

  signIn: '/auth/sign-in',
  // Параметризованный маршрут авторизации: '/auth/sign-in' | '/auth/sign-up'.
  auth: (mode) => `/auth/${mode}`,
};
