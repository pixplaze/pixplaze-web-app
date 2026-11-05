/**
 * Фильтры и сортировка листинга серверов на клиенте. Чистые функции над моделью {@link mapServer}.
 *
 * Категорий (ваниль, выживание, мини-игры) в API пока нет: определяем их по ключевым словам в названии,
 * MOTD и описании. Когда API начнёт отдавать теги, `matches` у категорий заменяется проверкой тега,
 * интерфейс фильтров не меняется.
 */

/** MOTD приходит с кодами форматирования Minecraft (`§a`) — для поиска слов их убираем. */
const plainText = (server) => [server.name, server.motd, server.description]
    .filter(Boolean)
    .join(' ')
    .replace(/§[0-9a-fk-or]/gi, '')
    .toLowerCase();

const byKeywords = (pattern) => (server) => pattern.test(plainText(server));

/**
 * Фильтры в порядке показа. Выбранные сочетаются через И: «Ваниль» + «Выживание» — ванильное выживание.
 * tag — фильтр описывает сам сервер (категория), а не его текущее состояние: такие показываются тегами на
 * странице сервера и ведут в поиск с этим фильтром.
 */
export const SERVER_FILTERS = [
  {
    id: 'no-queue',
    label: 'Без очереди',
    title: 'Сервер в сети и есть свободные места',
    matches: (server) => server.state?.status === 'ONLINE'
        && server.state.players != null
        && server.state.players.online < server.state.players.max
  },
  {
    id: 'vanilla',
    label: 'Ваниль',
    tag: true,
    title: 'Игра без модов и с минимумом плагинов',
    matches: byKeywords(/ванил|vanilla/)
  },
  {
    id: 'survival',
    label: 'Выживание',
    tag: true,
    title: 'Режим выживания, в том числе хардкор и анархия',
    matches: byKeywords(/выживан|survival|\bsmp\b|хардкор|hardcore|анархи|anarchy/)
  },
  {
    id: 'minigames',
    label: 'Мини-игры',
    tag: true,
    title: 'BedWars, SkyWars и другие мини-игры',
    matches: byKeywords(/мини-?игр|mini-?games?|bed\s?wars|sky\s?wars|murder|party|арен|arena/)
  }
];

const online = (server) => server.state?.status === 'ONLINE' ? (server.state.players?.online ?? 0) : -1;

/** Сортировки: без оценки и офлайн — в конце, при равенстве — больше голосов или выше рейтинг. */
export const SERVER_SORTS = [
  {
    id: 'rating',
    label: 'По рейтингу',
    compare: (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || (b.ratingCount ?? 0) - (a.ratingCount ?? 0)
  },
  {
    id: 'online',
    label: 'По онлайну',
    compare: (a, b) => online(b) - online(a) || (b.rating ?? -1) - (a.rating ?? -1)
  }
];

/**
 * @param {object[]} servers модели карточек
 * @param {Set<string>} filterIds выбранные фильтры
 * @param {string} sortId сортировка из {@link SERVER_SORTS}
 * @returns {object[]} новый массив, исходный не меняется
 */
export function applyServerFilters(servers, filterIds, sortId) {
  const active = SERVER_FILTERS.filter((filter) => filterIds.has(filter.id));
  const sort = SERVER_SORTS.find((s) => s.id === sortId) ?? SERVER_SORTS[0];
  // filter уже создаёт новый массив, поэтому sort на месте исходный листинг не трогает
  return servers
      .filter((server) => active.every((filter) => filter.matches(server)))
      .sort(sort.compare);
}

/** Теги сервера — фильтры-категории, которым он соответствует, в порядке показа фильтров. */
export const serverTags = (server) => SERVER_FILTERS.filter((filter) => filter.tag && filter.matches(server));

/** Ссылка на поиск с включённым фильтром (ServerList читает `?filter=` при открытии). */
export const filterHref = (filterId) => `/servers?filter=${encodeURIComponent(filterId)}`;
