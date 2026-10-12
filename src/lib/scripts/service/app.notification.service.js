import {appNotificationStore} from '$lib/scripts/store/app.notification.store.svelte.js';
import {noticeService} from '$lib/scripts/service/notice.service.js';
import {LEVEL} from '$lib/scripts/util/notice.util.js';

/** Сколько уведомление висит до автозакрытия, мс. Ошибки читают дольше. */
const DURATION = {
  [LEVEL.INFO]: 5000,
  [LEVEL.WARNING]: 5000,
  [LEVEL.ERROR]: 8000
};

/** Больше видимых уведомлений не держим: самые старые закрываются. */
const MAX_VISIBLE = 3;

/**
 * Глобальный центр уведомлений (показ — AppNotifications в шапке). Уведомления
 * временные и закрываемые; повтор того же текста и уровня не добавляет новое,
 * а перезапускает таймер существующего.
 */
class AppNotificationService {
  #timers = new Map();

  /** Видимые уведомления, новые первыми (read-only, реактивно). */
  get notifications() {
    return appNotificationStore.notifications;
  }

  info(message) {
    return this.#push(message, LEVEL.INFO);
  }

  warning(message) {
    return this.#push(message, LEVEL.WARNING);
  }

  error(message) {
    return this.#push(message, LEVEL.ERROR);
  }

  close(id) {
    clearTimeout(this.#timers.get(id));
    this.#timers.delete(id);
    appNotificationStore.notifications = appNotificationStore.notifications.filter(n => n.id !== id);
  }

  #push(message, level) {
    let notification = appNotificationStore.notifications
        .find(n => n.message === message && n.level === level);

    if (!notification) {
      notification = noticeService.create(message, level);
      appNotificationStore.notifications = [notification, ...appNotificationStore.notifications];
      appNotificationStore.notifications.slice(MAX_VISIBLE).forEach(n => this.close(n.id));
    }

    const id = notification.id;
    clearTimeout(this.#timers.get(id));
    this.#timers.set(id, setTimeout(() => this.close(id), DURATION[level]));
    return id;
  }
}

export const appNotificationService = new AppNotificationService();
