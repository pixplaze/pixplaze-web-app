import {bidsApi} from '$lib/scripts/api/bids.api.js';
import {createNotice, LEVEL} from '$lib/scripts/util/notice.util.js';
import {mapBid} from '$lib/scripts/util/server.mapper.js';
import {createLatest} from '$lib/scripts/util/latest.util.js';

/**
 * Заявки на подключение серверов: админ видит все с фильтром и решениями, остальные — свои.
 * Роль известна только после загрузки профиля, поэтому вид задаётся {@link setAdmin}.
 */
export class ServerBids {
  bids = $state([]);
  loading = $state(true);
  busyId = $state(null);
  notices = $state([]);
  formOpen = $state(false);

  #filter = $state('PENDING');
  #admin = null;
  #latest = createLatest();

  get filter() {
    return this.#filter;
  }

  set filter(filter) {
    this.#filter = filter;
    this.load();
  }

  /** Задать вид по роли; повторный вызов с той же ролью ничего не делает. */
  setAdmin(admin) {
    if (this.#admin === admin) return;
    this.#admin = admin;
    this.load();
  }

  toggleForm() {
    this.formOpen = !this.formOpen;
  }

  async load() {
    if (this.#admin === null) return;
    const isLatest = this.#latest.next();
    this.loading = true;
    try {
      const raw = this.#admin
          ? await bidsApi.fetchAll(this.#filter === 'ALL' ? null : this.#filter)
          : await bidsApi.fetchMine();
      // Ответ по устаревшему фильтру или роли отбрасываем
      if (!isLatest()) return;
      this.bids = raw.map(mapBid);
    } catch (e) {
      if (!isLatest()) return;
      this.notices = [createNotice(e.message, LEVEL.ERROR)];
    } finally {
      if (isLatest()) {
        this.loading = false;
      }
    }
  }

  approve(bid) {
    return this.#decide(bid, id => bidsApi.approve(id), 'подтверждена');
  }

  reject(bid) {
    return this.#decide(bid, id => bidsApi.reject(id), 'отклонена');
  }

  async #decide(bid, action, done) {
    this.busyId = bid.id;
    try {
      await action(bid.id);
      this.notices = [createNotice(`Заявка «${bid.name}» ${done}`, LEVEL.INFO)];
      await this.load();
    } catch (e) {
      this.notices = [createNotice(e.message, LEVEL.ERROR)];
    } finally {
      this.busyId = null;
    }
  }
}
