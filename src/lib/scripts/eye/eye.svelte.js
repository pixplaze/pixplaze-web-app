import {SvelteMap, SvelteSet} from 'svelte/reactivity';
import {ACTION_GROUPS, COMPLAINT_WINDOW, createDemoEyeSource} from '$scripts/eye/eye.source.js';
import {notifications} from '$scripts/notifications.svelte.js';

const HOUR = 3_600_000;

/** Периоды журнала; `around` — окно вокруг выбранного момента, включается кликом по времени записи. */
export const PERIODS = [
  {id: '1h', label: 'Час', ms: HOUR},
  {id: '24h', label: 'Сутки', ms: 24 * HOUR},
  {id: '7d', label: 'Неделя', ms: 7 * 24 * HOUR}
];

/** Периоды списка жалоб; null — без ограничения. */
export const COMPLAINT_PERIODS = [
  {id: '24h', label: 'Сутки', ms: 24 * HOUR},
  {id: '7d', label: 'Неделя', ms: 7 * 24 * HOUR},
  {id: 'all', label: 'Всё время', ms: null}
];

/** Чьи жалобы показывать в досье: поданные на игрока или им самим. */
export const COMPLAINT_DIRECTIONS = [
  {id: 'against', label: 'На игрока'},
  {id: 'by', label: 'От игрока'}
];

/** Фильтры списка досье. */
export const PLAYER_FILTERS = [
  {id: 'all', label: 'Все'},
  {id: 'online', label: 'В игре'},
  {id: 'suspects', label: 'Подозреваемые'},
  {id: 'banned', label: 'Забаненные'}
];

const AROUND_MS = 15 * 60_000;
const NEAR_RADIUS = 32;

/**
 * Состояние «Ока Саурона» на одном сервере: досье, выбранный игрок и его журнал с фильтрами.
 * source — источник данных (см. eye.source.js), moderator — от чьего имени баны и заметки.
 */
export class Eye {
  players = $state([]);
  loading = $state(true);

  query = $state('');
  playerFilter = $state('all');
  selectedUuid = $state(null);

  activities = $state([]);
  activitiesLoading = $state(true);

  groups = new SvelteSet();
  period = $state('7d');
  world = $state(null);
  /** @type {{world: string, x: number, y: number, z: number, radius: number}|null} */
  near = $state(null);
  /** @type {Date|null} */
  around = $state(null);

  /** Вкладка под действиями досье: журнал или жалобы. */
  tab = $state('log');
  /** На телефоне — открыто досье, а не список игроков. */
  showDossier = $state(false);

  /** Вкладка «Жалобы» панели: непросмотренные жалобы сервера и отмеченные за этот заход. */
  inbox = $state([]);
  inboxLoading = $state(true);
  inboxCategories = new SvelteSet();
  inboxPeriod = $state('all');

  complaints = $state([]);
  complaintsLoading = $state(true);
  complaintDirection = $state('against');
  complaintCategories = new SvelteSet();
  complaintPeriod = $state('all');

  #source;
  #moderator;
  #request = 0;
  #complaintsRequest = 0;
  #loaded = false;

  constructor(source, moderator) {
    this.#source = source;
    this.#moderator = moderator;
  }

  /** Подозреваемые и забаненные — сверху: модератору важнее всего они. */
  get shownPlayers() {
    const q = this.query.trim().toLowerCase();
    const rank = (p) => (p.suspect ? 0 : p.ban ? 1 : p.online ? 2 : 3);
    return this.players
        .filter((p) => !q || p.name.toLowerCase().includes(q) || p.profileName?.toLowerCase().includes(q))
        .filter((p) => this.playerFilter === 'all'
            || (this.playerFilter === 'online' && p.online)
            || (this.playerFilter === 'suspects' && p.suspect)
            || (this.playerFilter === 'banned' && p.ban))
        .sort((a, b) => rank(a) - rank(b) || b.lastSeen - a.lastSeen);
  }

  get counts() {
    return {
      all: this.players.length,
      online: this.players.filter((p) => p.online).length,
      suspects: this.players.filter((p) => p.suspect).length,
      banned: this.players.filter((p) => p.ban).length
    };
  }

  get selected() {
    return this.players.find((p) => p.uuid === this.selectedUuid) ?? null;
  }

  /** Жалобы выбранного игрока с фильтрами вкладки «Жалобы»; непросмотренные — сверху. */
  get shownComplaints() {
    const uuid = this.selectedUuid;
    return sortByReview(filterComplaints(this.complaints, this.complaintCategories, this.complaintPeriod)
        .filter((c) => (this.complaintDirection === 'against' ? c.accusedUuid === uuid : c.authorUuid === uuid)));
  }

  /** Жалобы сервера для вкладки панели: непросмотренные сверху, отмеченные сейчас — внизу. */
  get shownInbox() {
    return sortByReview(filterComplaints(this.inbox, this.inboxCategories, this.inboxPeriod));
  }

  get unreviewedCount() {
    return this.inbox.filter((c) => !c.reviewed).length;
  }

  get hasInboxFilters() {
    return this.inboxCategories.size > 0 || this.inboxPeriod !== 'all';
  }

  get complaintCounts() {
    return {
      against: this.complaints.filter((c) => c.accusedUuid === this.selectedUuid).length,
      by: this.complaints.filter((c) => c.authorUuid === this.selectedUuid).length
    };
  }

  get hasComplaintFilters() {
    return this.complaintCategories.size > 0 || this.complaintPeriod !== 'all';
  }

  get hasFilters() {
    return this.groups.size > 0 || this.world !== null || this.near !== null || this.around !== null || this.period !== '7d';
  }

  /** Первая загрузка; повторный показ вкладки состояние не сбрасывает. */
  ensureLoaded() {
    if (this.#loaded) return;
    this.#loaded = true;
    this.load();
    this.loadInbox();
  }

  async load() {
    this.loading = true;
    try {
      this.players = await this.#source.players();
      if (!this.selectedUuid && this.shownPlayers.length) {
        await this.select(this.shownPlayers[0].uuid);
      }
    } catch {
      notifications.error('Не удалось загрузить досье игроков');
    } finally {
      this.loading = false;
    }
  }

  /** Вкладка остаётся прежней: модератор может пройтись по жалобам нескольких игроков подряд. */
  async select(uuid) {
    this.selectedUuid = uuid;
    this.resetFilters(false);
    this.resetComplaintFilters();
    this.complaintDirection = 'against';
    await Promise.all([this.reload(), this.loadComplaints()]);
  }

  async loadInbox() {
    this.inboxLoading = true;
    try {
      this.inbox = await this.#source.serverComplaints({reviewed: false});
    } catch {
      notifications.error('Не удалось загрузить жалобы сервера');
    } finally {
      this.inboxLoading = false;
    }
  }

  /**
   * Отметить жалобу просмотренной или снять отметку — сразу и в досье, и во вкладке сервера.
   * Отмеченная остаётся в списке сервера до следующей загрузки — её можно вернуть.
   */
  async setReviewed(complaint, reviewed) {
    try {
      const updated = await this.#source.setComplaintReviewed(complaint.id, reviewed, this.#moderator);
      const replace = (list) => list.map((c) => (c.id === updated.id ? updated : c));
      this.complaints = replace(this.complaints);
      this.inbox = this.inbox.some((c) => c.id === updated.id) ? replace(this.inbox) : [updated, ...this.inbox];
    } catch {
      notifications.error('Не удалось сохранить отметку');
    }
  }

  toggleInboxCategory(category) {
    this.inboxCategories.has(category) ? this.inboxCategories.delete(category) : this.inboxCategories.add(category);
  }

  resetInboxFilters() {
    this.inboxCategories.clear();
    this.inboxPeriod = 'all';
  }

  /** Открыть досье игрока (на телефоне — сразу экран досье). */
  async openPlayer(uuid) {
    this.showDossier = true;
    if (uuid !== this.selectedUuid) await this.select(uuid);
  }

  async loadComplaints() {
    const request = ++this.#complaintsRequest;
    this.complaintsLoading = true;
    try {
      const result = await this.#source.complaints(this.selectedUuid);
      if (request !== this.#complaintsRequest) return;
      this.complaints = result;
    } catch {
      notifications.error('Не удалось загрузить жалобы');
    } finally {
      if (request === this.#complaintsRequest) this.complaintsLoading = false;
    }
  }

  /** Действия обвиняемого вокруг жалобы — 2 часа до и 30 минут после, по времени. */
  async complaintWindow(complaint) {
    const at = complaint.at.getTime();
    const list = await this.#source.activities(complaint.accusedUuid, {
      since: new Date(at - COMPLAINT_WINDOW.beforeMs),
      until: new Date(at + COMPLAINT_WINDOW.afterMs)
    });
    return list.filter((a) => !a.action.startsWith('complaint-')).sort((a, b) => a.at - b.at);
  }

  toggleComplaintCategory(category) {
    this.complaintCategories.has(category) ? this.complaintCategories.delete(category) : this.complaintCategories.add(category);
  }

  resetComplaintFilters() {
    this.complaintCategories.clear();
    this.complaintPeriod = 'all';
  }

  /** Перейти в журнал игрока на ±15 минут вокруг момента — из жалобы. */
  async openLogAround(uuid, at) {
    this.tab = 'log';
    this.showDossier = true;
    if (uuid !== this.selectedUuid) await this.select(uuid);
    this.resetFilters(false);
    this.showAround(at);
  }

  /** Журнал выбранного игрока с текущими фильтрами; ответ на устаревший запрос отбрасывается. */
  async reload() {
    if (!this.selectedUuid) return;
    const request = ++this.#request;
    this.activitiesLoading = true;
    const actions = new Set(ACTION_GROUPS.filter((g) => this.groups.has(g.id)).flatMap((g) => g.actions));
    const filter = {actions, world: this.world, near: this.near};
    if (this.around) {
      filter.since = new Date(this.around.getTime() - AROUND_MS);
      filter.until = new Date(this.around.getTime() + AROUND_MS);
    } else {
      filter.since = new Date(Date.now() - PERIODS.find((p) => p.id === this.period).ms);
    }
    const result = await this.#source.activities(this.selectedUuid, filter);
    if (request !== this.#request) return;
    this.activities = result;
    this.activitiesLoading = false;
  }

  toggleGroup(id) {
    this.groups.has(id) ? this.groups.delete(id) : this.groups.add(id);
    this.reload();
  }

  setPeriod(id) {
    this.period = id;
    this.around = null;
    this.reload();
  }

  setWorld(world) {
    this.world = world;
    this.reload();
  }

  /** Всё, что происходило рядом с точкой (по X/Z, в том же мире). */
  showNear(activity) {
    this.near = {world: activity.world, x: activity.x, y: activity.y, z: activity.z, radius: NEAR_RADIUS};
    this.reload();
  }

  /** Всё, что игрок делал за 15 минут до и после момента. */
  showAround(at) {
    this.around = at;
    this.reload();
  }

  resetFilters(reload = true) {
    this.groups.clear();
    this.period = '7d';
    this.world = null;
    this.near = null;
    this.around = null;
    if (reload) this.reload();
  }

  /** durationMs: null — навсегда; byIp — бан по IP (`/ban-ip`). */
  async ban(reason, durationMs, byIp) {
    await this.#update(() => this.#source.ban(this.selectedUuid, {reason, durationMs, byIp}, this.#moderator), 'Игрок забанен');
  }

  async unban() {
    await this.#update(() => this.#source.unban(this.selectedUuid), 'Бан снят');
  }

  async mute(reason, durationMs) {
    await this.#update(() => this.#source.mute(this.selectedUuid, {reason, durationMs}, this.#moderator), 'Игрок замучен');
  }

  async unmute() {
    await this.#update(() => this.#source.unmute(this.selectedUuid), 'Мут снят');
  }

  async kick(reason) {
    await this.#update(() => this.#source.kick(this.selectedUuid, reason, this.#moderator), 'Игрок кикнут');
  }

  async markSuspect(note) {
    await this.#update(() => this.#source.markSuspect(this.selectedUuid, note, this.#moderator), 'Игрок в списке подозреваемых');
  }

  async clearSuspect() {
    await this.#update(() => this.#source.clearSuspect(this.selectedUuid), 'Подозрение снято');
  }

  async #update(call, message) {
    try {
      const updated = await call();
      this.players = this.players.map((p) => (p.uuid === updated.uuid ? {...p, ...updated} : p));
      notifications.info(message);
    } catch {
      notifications.error('Не удалось сохранить изменения');
    }
  }
}

const byReviewThenTime = (a, b) => (!!a.reviewed - !!b.reviewed) || (b.at - a.at);
const sortByReview = (list) => [...list].sort(byReviewThenTime);

function filterComplaints(list, categories, periodId) {
  const ms = COMPLAINT_PERIODS.find((p) => p.id === periodId).ms;
  const since = ms == null ? null : Date.now() - ms;
  return list
      .filter((c) => !categories.size || categories.has(c.category))
      .filter((c) => since == null || c.at >= since);
}

/**
 * Одно «Око» на сервер: вкладки панели («Око Саурона» и «Жалобы») работают с общим состоянием —
 * отметка «просмотрено» в одной сразу видна в другой. Источник пока демонстрационный.
 */
const eyes = new SvelteMap();

export function eyeFor(serverId, moderator) {
  if (!eyes.has(serverId)) eyes.set(serverId, new Eye(createDemoEyeSource(serverId), moderator));
  return eyes.get(serverId);
}

/** Уже созданное «Око» сервера — для счётчика на вкладке, без загрузки. */
export const existingEye = (serverId) => eyes.get(serverId) ?? null;
