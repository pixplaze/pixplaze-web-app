/** Стандартный порт Java-сервера Minecraft: в адресе для подключения его не пишут. */
const DEFAULT_PORT = 25565;

/** Адрес для показа и копирования в клиент: `address` при стандартном порте, иначе `address:port`. */
export function formatAddress(address, port) {
  return port === DEFAULT_PORT ? address : `${address}:${port}`;
}

/**
 * Где игрок в сети — продолжение фразы «в сети на …»: «Hypixel (mc.hypixel.net)», без адреса — только
 * название; сервер, которого web-api ещё не знает, — «сервере #id».
 * @param {{id: number, name?: string, hosts?: {address: string, port: number, type: string}[]}} server
 *        краткие сведения о сервере (`MinecraftServerInfo.brief`)
 */
export function formatServerWhere(server) {
  const name = server.name ?? `сервере #${server.id}`;
  const address = gameAddress(server.hosts);
  return address ? `${name} (${address})` : name;
}

/**
 * Игровой адрес сервера: запись HOST из `hosts`, отформатированная {@link formatAddress}.
 *
 * @param {{address: string, port: number, type: string}[] | null | undefined} hosts
 * @returns {string | null} адрес или null, если сервер не объявил игровой адрес
 */
export function gameAddress(hosts) {
  const host = hosts?.find(h => h.type === 'HOST');
  if (!host) return null;
  return formatAddress(host.address, host.port);
}

/**
 * Адрес `address:port` записи нужного типа из `hosts`: MAP — веб-карта, API — плагин Pixplaze
 * (консоль и чат).
 *
 * @param {{address: string, port: number, type: string}[] | null | undefined} hosts
 * @param {'MAP' | 'API'} type
 * @returns {string | null} адрес или null, если сервер такой записи не объявил
 */
export function hostAddress(hosts, type) {
  const host = hosts?.find(h => h.type === type);
  return host ? `${host.address}:${host.port}` : null;
}

const BID_STATUS_LABELS = {
  PENDING: 'На рассмотрении',
  ACTIVE: 'Подтверждена',
  REJECTED: 'Отклонена',
  EXPIRED: 'Истекла'
};

/** Ответ API (`MinecraftServerBidInfo`) → модель строки списка заявок. */
export const mapBid = b => ({
  id: b.id,
  name: b.name,
  // У закрытой заявки адреса может не быть: его занял другой сервер
  address: b.host ? formatAddress(b.host, b.port) : null,
  status: b.status,
  statusLabel: BID_STATUS_LABELS[b.status] ?? b.status,
  pending: b.status === 'PENDING',
  code: b.inviteCode,
  applicant: b.applicant,
  createdAt: b.createdAt,
  expiresAt: b.expiresAt
});

/** Ответ API (`MinecraftServerInfo`) → модель карточки сервера. */
export const mapServer = s => ({
  id: s.id,
  name: s.name,
  host: gameAddress(s.hosts),
  hosts: s.hosts ?? [],
  image: s.iconBase64,
  motd: s.motd,
  core: s.core,
  state: s.state,
  rating: s.rating,
  language: s.language ?? 'RU'
});
