/**
 * Стор Device-Consent-Flow (DCF) — реактивное состояние подтверждающей стороны
 * device-flow (RFC 8628, §5.3–5.4). Per-instance (фабрика), без логики и API.
 * Логика — в `device.consent.service.js`.
 */
export function createDeviceConsentStore() {
  const store = $state({
    info: null,        // DeviceAuthorizationInfo — что подтверждаем (панель согласия)
    busy: false,       // запрос в полёте (загрузка info / отправка решения)
    done: null,        // 'approved' | 'denied' | null — итог
    failed: false,     // ошибка последнего действия
    approvingCode: '', // user_code, который разбираем/подтверждаем
  });
  return store;
}
