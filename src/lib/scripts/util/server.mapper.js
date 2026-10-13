/** Стандартный порт Java-сервера Minecraft: в адресе для подключения его не пишут. */
const DEFAULT_PORT = 25565;

/** Адрес для показа и копирования в клиент: `address` при стандартном порте, иначе `address:port`. */
export function formatAddress(address, port) {
  return port === DEFAULT_PORT ? address : `${address}:${port}`;
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
  APPROVED: 'Подтверждена',
  REJECTED: 'Отклонена',
  EXPIRED: 'Истекла'
};

/** Ответ API (`MinecraftServerBidInfo`) → модель строки списка заявок. */
export const mapBid = b => ({
  id: b.id,
  name: b.name,
  address: formatAddress(b.host, b.port),
  plugin: b.integration === 'PLUGIN',
  status: b.status,
  statusLabel: BID_STATUS_LABELS[b.status] ?? b.status,
  pending: b.status === 'PENDING',
  code: b.inviteCode,
  owner: b.ownerUsername,
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
  rating: s.rating
});
