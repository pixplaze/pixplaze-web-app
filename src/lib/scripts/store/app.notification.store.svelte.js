/**
 * Глобальные уведомления приложения: {id, message, level}, новые первыми.
 * Чистое состояние, логика (таймеры, склейка повторов) — в app.notification.service.
 */
class AppNotificationStore {
  notifications = $state([]);
}

export const appNotificationStore = new AppNotificationStore();
