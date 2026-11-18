import {
    PIXPLAZE_WEB_API_URL,
    PUBLIC_WEB_PUSH_ENABLED,
    PUBLIC_WEB_PUSH_SUBSCRIPTIONS_PATH,
    PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY
} from '$app/env/public';
import {app} from "#scripts/app.svelte.js";

const pushEnabled = PUBLIC_WEB_PUSH_ENABLED === 'true';
const vapidPublicKey = PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
const subscriptionsPath = PUBLIC_WEB_PUSH_SUBSCRIPTIONS_PATH || '/api/v1/push/subscriptions';

function isBrowserPushSupported() {
    return (typeof window !== 'undefined' &&
        window.isSecureContext &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window);
}
function assertPushConfigured() {
    if (!pushEnabled) {
        throw new Error('Web Push пока отключён в конфигурации приложения.');
    }
    if (!vapidPublicKey) {
        throw new Error('Не задан публичный VAPID-ключ.');
    }
}
function base64UrlToArrayBuffer(base64Url) {
    const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
    const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    const bytes = Uint8Array.from(raw, (character) => character.charCodeAt(0));
    return bytes.buffer;
}
function getSubscriptionsUrl() {
    const apiOrigin = PIXPLAZE_WEB_API_URL || window.location.origin;
    return new URL(subscriptionsPath, `${apiOrigin.replace(/\/+$/, '')}/`).toString();
}
async function sendSubscriptionRequest(method, body) {
    const response = await fetch(getSubscriptionsUrl(), {
        method,
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error(`Backend не сохранил push-подписку (HTTP ${response.status}).`);
    }
}
export async function getPushUiState() {
    if (!pushEnabled)
        return { kind: 'disabled' };
    if (!vapidPublicKey) {
        return { kind: 'misconfigured', reason: 'Не задан публичный VAPID-ключ.' };
    }
    if (typeof window === 'undefined')
        return { kind: 'checking' };
    if (!window.isSecureContext) {
        return { kind: 'unsupported', reason: 'Для Push API требуется HTTPS (или localhost при разработке).' };
    }
    if (app.isAppleMobile && !app.isInstalled) {
        return {
            kind: 'install-required',
            reason: 'На iPhone/iPad сначала добавьте сайт на экран «Домой», затем откройте его с иконки.'
        };
    }
    if (!isBrowserPushSupported()) {
        return { kind: 'unsupported', reason: 'Этот браузер не поддерживает необходимые Push API.' };
    }
    if (Notification.permission === 'denied')
        return { kind: 'permission-denied' };
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        return subscription ? { kind: 'subscribed' } : { kind: 'not-subscribed' };
    }
    catch {
        return {
            kind: 'unsupported',
            reason: 'Не удалось получить регистрацию Service Worker. Перезагрузите страницу и попробуйте снова.'
        };
    }
}
/** Call this only from a deliberate user action, such as clicking a button. */
export async function enablePushNotifications() {
    assertPushConfigured();
    if (typeof window === 'undefined' || !isBrowserPushSupported()) {
        throw new Error('Push API недоступен в этом браузере или контексте.');
    }
    if (app.isAppleMobile && !app.isInstalled) {
        throw new Error('На iPhone/iPad сначала добавьте приложение на экран «Домой» и откройте его оттуда.');
    }
    if (Notification.permission === 'denied') {
        throw new Error('Уведомления запрещены в настройках браузера или устройства.');
    }
    // Keep this call directly inside the click flow. Do not request permission
    // automatically on page load or after an unrelated asynchronous operation.
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error('Разрешение на уведомления не предоставлено.');
    }
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    const createdHere = subscription === null;
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64UrlToArrayBuffer(vapidPublicKey)
        });
    }
    try {
        // Contract for the future Spring Boot API: POST the PushSubscription JSON.
        // The backend must associate it with the currently authenticated user.
        await sendSubscriptionRequest('POST', subscription.toJSON());
    }
    catch (error) {
        // Do not leave a newly-created browser subscription that the backend never
        // learned about. Existing subscriptions are preserved so the user can retry.
        if (createdHere)
            await subscription.unsubscribe();
        throw error;
    }
}
/** The backend is notified first; keep the local subscription if that fails. */
export async function disablePushNotifications() {
    assertPushConfigured();
    if (typeof window === 'undefined' || !('serviceWorker' in navigator))
        return;
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription)
        return;
    await sendSubscriptionRequest('DELETE', { endpoint: subscription.endpoint });
    await subscription.unsubscribe();
}
