import {ACTIONS, MATERIAL_NAMES} from '$scripts/eye/eye.source.js';

/** «5 мин назад», «3 ч назад», «вчера», дальше — дата. */
export function relativeTime(date, now = Date.now()) {
  const diff = Math.max(0, now - date.getTime());
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} ч назад`;
  if (hours < 48) return 'вчера';
  return date.toLocaleDateString(undefined, {day: 'numeric', month: 'short'});
}

export const fullTime = (date) => date.toLocaleString(undefined, {
  day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit'
});

export const clockTime = (date) => date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit'});

export const dayLabel = (date) => date.toLocaleDateString(undefined, {weekday: 'long', day: 'numeric', month: 'long'});

/** 37 ч 20 мин */
export function duration(ms) {
  const totalMin = Math.round(ms / 60_000);
  const hours = Math.floor(totalMin / 60);
  return hours ? `${hours} ч ${totalMin % 60} мин` : `${totalMin} мин`;
}

export const materialName = (key) => (key ? MATERIAL_NAMES[key] ?? key.replaceAll('_', ' ') : '');

export const tpCommand = (a) => `/tp @s ${a.x} ${a.y} ${a.z}`;

/** Сколько до или после момента, компактно для колонки времени: «−1:05», «+0:12» (часы:минуты). */
export function offsetLabel(at, from) {
  const diff = at.getTime() - from.getTime();
  const totalMin = Math.round(Math.abs(diff) / 60_000);
  return `${diff < 0 ? '−' : '+'}${Math.floor(totalMin / 60)}:${String(totalMin % 60).padStart(2, '0')}`;
}

/**
 * Строка журнала словами: глагол, предмет действия и уточнение.
 * Чат и команды — как написаны, жалобы — ник и категория, остальное — название блока или предмета.
 */
export function describeActivity(a) {
  if (a.action === 'entity-death' && a.subject === 'player') return {verb: 'убил игрока', subject: a.target, target: null};
  const verbatim = a.action === 'player-chat' || a.action === 'player-command' || a.action.startsWith('complaint-');
  return {verb: ACTIONS[a.action]?.verb ?? a.action, subject: verbatim ? a.subject : materialName(a.subject), target: a.target};
}

/** Цвет «аватара» по нику — чтобы игроков было легко различать в списке. */
export function nameHue(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}
