import {browser} from '$app/environment';
import {token} from '$api/token.svelte.js';
import {permissionsApi} from '$api/permissions.api.js';
import {implies} from '$util/permission.util.js';

const HINT_KEY = 'permissions';
const CATALOG_KEY = 'permissionCatalog';
const EMPTY_HINT = {system: [], servers: {}};

/**
 * Права текущего пользователя для интерфейса — только чтобы прятать и показывать экраны: решения
 * принимает web-api или плагин. Подсказка `{system, servers}` приходит в ответах входа, регистрации
 * и refresh и лежит рядом с токеном (localStorage, синхронизация вкладок); выход очищает её.
 *
 * Каталог (`имя константы → код права`) скачивается при запуске с `If-None-Match`: не изменился —
 * берётся сохранённая копия. Права в коде указываются через каталог: `permissions.can(catalog.X)`.
 */
class Permissions {
  #hint = $state(EMPTY_HINT);
  #catalog = $state({});
  #hasHint = false;

  constructor() {
    if (!browser) {
      return;
    }
    const savedHint = read(HINT_KEY);
    this.#hasHint = savedHint !== null;
    this.#hint = savedHint ?? EMPTY_HINT;
    this.#catalog = read(CATALOG_KEY)?.permissions ?? {};

    window.addEventListener('storage', (event) => {
      if (event.key === HINT_KEY || event.key === null) {
        this.#hint = read(HINT_KEY) ?? EMPTY_HINT;
      }
    });

    // Выход (в том числе в другой вкладке) — подсказка больше не принадлежит никому
    $effect.root(() => {
      $effect(() => {
        if (!token.value) this.#setHint(EMPTY_HINT);
      });
    });

    this.#loadCatalog();
  }

  /** Каталог прав: имя константы → код (реактивно). Пока не загружен — пустой. */
  get catalog() {
    return this.#catalog;
  }

  /** Сохранена ли подсказка. Нет — сессия старше подсказок, её стоит обновить. */
  get hasHint() {
    return this.#hasHint;
  }

  /** Подсказка из ответа входа/регистрации/refresh. */
  set(hint) {
    this.#setHint(hint ? {system: hint.system ?? [], servers: hint.servers ?? {}} : EMPTY_HINT);
  }

  /** Есть ли системное право (реактивно). */
  can(permission) {
    return implies(this.#hint.system, permission);
  }

  /** Есть ли право на сервере `serverId` (реактивно). */
  canOn(serverId, permission) {
    return implies(this.#hint.servers[serverId], permission);
  }

  #setHint(hint) {
    this.#hint = hint;
    this.#hasHint = true;
    if (browser) {
      localStorage.setItem(HINT_KEY, JSON.stringify(hint));
    }
  }

  async #loadCatalog() {
    const saved = read(CATALOG_KEY);
    try {
      const result = await permissionsApi.fetchCatalog(saved?.version);
      if (result.notModified) return;
      localStorage.setItem(CATALOG_KEY, JSON.stringify(result));
      this.#catalog = result.permissions;
    } catch {
      // web-api недоступен — остаётся сохранённая копия
    }
  }
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

export const permissions = new Permissions();
