/**
 * «Око Саурона» — досье игроков сервера: кто, когда и где что делал, баны, муты и подозреваемые.
 *
 * Здесь — каталог действий и источник данных. Источник сейчас демонстрационный ({@link createDemoEyeSource}):
 * детерминированные досье и журнал за неделю, правки (бан, мут, подозрение) живут только в памяти вкладки.
 * Боевой источник реализует тот же интерфейс:
 *   - журнал — эндпоинт плагина поверх Prism или CoreProtect (`GET /server/activities`, см. требования
 *     к журналу действий); ключи действий ниже — ключи Prism;
 *   - бан, мут, кик — команды через плагин (`/ban`, `/ban-ip`, `/pardon`, `/kick`; мут — плагином модерации);
 *   - голова скина — `MinecraftPlayerInfo.skinHeadBase64`, как в остальном Pixplaze;
 *   - подозреваемые и заметки — хранилище web-api, общее для модераторов сервера;
 *   - жалобы — игрок подаёт в игре (`/report <ник> <текст>`), плагин добавляет место и время и отправляет
 *     в web-api; в журнал игрока они подмешиваются действиями `complaint-received` и `complaint-filed`.
 *
 * @typedef {{reason: string, by: string, at: Date, until: Date|null}} EyePunishment until null — навсегда
 * @typedef {{uuid: string, name: string, skinHeadBase64: string|null, online: boolean,
 *   firstSeen: Date, lastSeen: Date, playtimeMs: number, isOperator: boolean,
 *   profileName: string|null, profileRegisteredAt: Date|null, complaintsCount: number,
 *   ban: (EyePunishment & {byIp: boolean})|null, mute: EyePunishment|null,
 *   suspect: {note: string, by: string, at: Date}|null}} EyePlayer
 * @typedef {{id: string, category: string, text: string, at: Date, world: string, x: number, y: number, z: number,
 *   authorUuid: string, authorName: string, accusedUuid: string, accusedName: string,
 *   reviewed: {by: string, at: Date}|null}} EyeComplaint
 *   место — где стоял автор, когда подавал жалобу; reviewed — модератор отметил «просмотрено»
 * @typedef {{id: string, playerUuid: string, action: string, subject: string|null, target: string|null,
 *   world: string, x: number, y: number, z: number, at: Date}} EyeActivity
 * @typedef {{actions?: Set<string>, since?: Date|null, until?: Date|null, world?: string|null,
 *   near?: {world: string, x: number, z: number, radius: number}|null}} EyeActivityFilter
 */

/** Группы действий — чипы фильтра журнала. Внутри группы — ключи действий Prism. */
export const ACTION_GROUPS = [
  {id: 'blocks', label: 'Блоки', icon: 'version', actions: ['block-break', 'block-place']},
  {id: 'containers', label: 'Сундуки', icon: 'lock', actions: ['item-remove', 'item-insert']},
  {id: 'items', label: 'Предметы', icon: 'repost', actions: ['item-drop', 'item-pickup']},
  {id: 'combat', label: 'Бой', icon: 'warning', actions: ['entity-death', 'player-death']},
  {id: 'chat', label: 'Чат', icon: 'chat', actions: ['player-chat']},
  {id: 'commands', label: 'Команды', icon: 'console', actions: ['player-command']},
  {id: 'sessions', label: 'Входы', icon: 'sign-out', actions: ['player-join', 'player-quit']},
  {id: 'complaints', label: 'Жалобы', icon: 'flag', actions: ['complaint-received', 'complaint-filed']}
];

/** Категории жалоб — игрок выбирает при подаче, модератор фильтрует по ним. */
export const COMPLAINT_CATEGORIES = ['Читы', 'Гриферство', 'Воровство', 'Оскорбления', 'Другое'];

/** Окно действий обвиняемого вокруг жалобы: до и после. */
export const COMPLAINT_WINDOW = {beforeMs: 2 * 3_600_000, afterMs: 30 * 60_000};

/** Подпись действия в журнале: глагол и пиктограмма. */
export const ACTIONS = {
  'block-break': {verb: 'сломал', icon: 'minus'},
  'block-place': {verb: 'поставил', icon: 'plus'},
  'item-remove': {verb: 'взял из сундука', icon: 'unlock'},
  'item-insert': {verb: 'положил в сундук', icon: 'lock'},
  'item-drop': {verb: 'выбросил', icon: 'arrow-down'},
  'item-pickup': {verb: 'подобрал', icon: 'arrow-up'},
  'entity-death': {verb: 'убил', icon: 'warning'},
  'player-death': {verb: 'погиб', icon: 'heart'},
  'player-chat': {verb: 'написал', icon: 'chat'},
  'player-command': {verb: 'выполнил', icon: 'console'},
  'player-join': {verb: 'зашёл на сервер', icon: 'sign-out'},
  'player-quit': {verb: 'вышел с сервера', icon: 'sign-out'},
  'complaint-received': {verb: 'жалоба от', icon: 'flag'},
  'complaint-filed': {verb: 'пожаловался на', icon: 'flag'}
};

/** Человеческие названия частых блоков и предметов; остальное показывается ключом Minecraft. */
export const MATERIAL_NAMES = {
  stone: 'камень', deepslate: 'глубинный сланец', diamond_ore: 'алмазная руда',
  deepslate_diamond_ore: 'глубинная алмазная руда', iron_ore: 'железная руда', oak_log: 'дубовое бревно',
  oak_planks: 'дубовые доски', glass: 'стекло', torch: 'факел', chest: 'сундук', diamond: 'алмаз',
  iron_ingot: 'железный слиток', bread: 'хлеб', cobblestone: 'булыжник', dirt: 'земля',
  netherite_ingot: 'незеритовый слиток', golden_apple: 'золотое яблоко', tnt: 'динамит',
  redstone_wire: 'редстоун', netherrack: 'незерак', zombie: 'зомби', skeleton: 'скелет', creeper: 'крипер', player: 'игрок'
};

export const WORLDS = ['world', 'world_nether', 'world_the_end'];
export const WORLD_NAMES = {world: 'Обычный мир', world_nether: 'Незер', world_the_end: 'Энд'};

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Детерминированный генератор — одинаковые данные при каждой загрузке. */
function random(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Игроки демо-сервера. behaviour — какой журнал сгенерировать: обычный строитель, «рентгеновский» шахтёр,
 * вор из сундуков, PvP-игрок.
 */
const DEMO_PLAYERS = [
  {name: 'Steve_B', profileName: 'SteveBuilder', behaviour: 'builder', base: [120, 70, -340], days: 60, online: true},
  {name: 'KateC', profileName: 'KateCraft', behaviour: 'builder', base: [-410, 68, 95], days: 45, online: true},
  {name: 'diamond_digger', profileName: null, behaviour: 'xray', base: [880, -58, 1210], days: 3, online: true,
    suspect: {note: '47 алмазной руды за два часа, почти без камня вокруг. Похоже на X-Ray — проверить по журналу.', by: 'KateC', hoursAgo: 5}},
  {name: 'Herobrine_Real', profileName: null, behaviour: 'thief', base: [118, 70, -335], days: 9, online: false,
    suspect: {note: 'Steve_B жалуется на пропажу алмазов из сундуков на базе.', by: 'uxadmin', hoursAgo: 26}},
  {name: 'xX_PvP_Xx', profileName: null, behaviour: 'pvp', base: [40, 64, 40], days: 14, online: false,
    ban: {reason: 'Килаура: убийства через стены, 9 жалоб', by: 'KateC', hoursAgo: 30, days: 30}},
  {name: 'AlexM', profileName: 'AlexMiner', behaviour: 'miner', base: [300, 12, -80], days: 40, online: false},
  {name: 'NotchFan01', profileName: 'NotchFan', behaviour: 'builder', base: [-60, 72, 600], days: 20, online: false},
  {name: 'UxTester', profileName: 'uxtester', behaviour: 'builder', base: [12, 65, 14], days: 30, online: false, isOperator: true},
  {name: 'uxadmin', profileName: 'uxadmin', behaviour: 'builder', base: [0, 64, 0], days: 90, online: false, isOperator: true},
  {name: 'Max_O', profileName: 'MaxOwner', behaviour: 'miner', base: [-900, 30, -900], days: 120, online: false}
];

/**
 * Жалобы демо-сервера. pick — к какому действию обвиняемого привязать: жалоба подаётся через несколько минут
 * после него, автор стоит рядом. Так в окне жалобы видно, на что жаловались.
 */
const DEMO_COMPLAINTS = [
  {author: 'Steve_B', accused: 'Herobrine_Real', category: 'Воровство', pick: 'item-remove',
    text: 'Пропали алмазы и незерит из сундука на базе, рядом крутился Herobrine_Real'},
  {author: 'KateC', accused: 'Herobrine_Real', category: 'Воровство', pick: 'item-remove', reviewedBy: 'uxadmin',
    text: 'Видела, как он открывал сундуки у Стива'},
  {author: 'Steve_B', accused: 'Herobrine_Real', category: 'Гриферство', pick: 'block-break',
    text: 'Сломал сундук у входа на базу'},
  {author: 'AlexM', accused: 'xX_PvP_Xx', category: 'Читы', pick: 'entity-death',
    text: 'Убил меня через стену, бьёт не глядя'},
  {author: 'NotchFan01', accused: 'xX_PvP_Xx', category: 'Читы', pick: 'entity-death',
    text: 'Килаура 100%, крутится как волчок'},
  {author: 'KateC', accused: 'xX_PvP_Xx', category: 'Оскорбления', pick: 'player-chat',
    text: 'Пишет гадости в чат после каждого убийства'},
  {author: 'NotchFan01', accused: 'diamond_digger', category: 'Читы', pick: 'block-break',
    text: 'Копает прямо к алмазам, ни одной лишней ветки. X-Ray?'},
  {author: 'Max_O', accused: 'KateC', category: 'Другое', pick: 'block-place', reviewedBy: 'uxadmin',
    text: 'Строится на месте, которое я застолбил под базу'},
  {author: 'Herobrine_Real', accused: 'Steve_B', category: 'Оскорбления', pick: 'player-chat',
    text: 'Называет меня вором в общем чате'}
];

const uuidFor = (name, rnd) => {
  const hex = () => Math.floor(rnd() * 16).toString(16);
  const part = (n) => Array.from({length: n}, hex).join('');
  return `${part(8)}-${part(4)}-4${part(3)}-a${part(3)}-${part(12)}`;
};

/** Журнал одного игрока за 7 суток: сессии, внутри — действия по его поведению. */
function generateActivities(player, rnd, now) {
  const out = [];
  const [bx, by, bz] = player.base;
  let n = 0;
  const push = (action, subject, at, {target = null, world = 'world', dx = 12, dy = 4, dz = 12, x, y, z} = {}) => {
    out.push({
      id: `${player.uuid}-${n++}`, playerUuid: player.uuid, action, subject, target, world,
      x: x ?? Math.round(bx + (rnd() - .5) * 2 * dx),
      y: y ?? Math.round(by + (rnd() - .5) * 2 * dy),
      z: z ?? Math.round(bz + (rnd() - .5) * 2 * dz),
      at: new Date(at)
    });
  };

  const sessions = player.online ? 5 : 4;
  // Дни прошлых сессий — разные из последних шести, чтобы сессии не накладывались
  const days = [1, 2, 3, 4, 5, 6].sort(() => rnd() - .5);
  for (let s = 0; s < sessions; s++) {
    // Сессия вечером одного из последних дней; у онлайн-игрока последняя — сейчас
    const isCurrent = player.online && s === sessions - 1;
    const day = isCurrent ? 0 : days[s];
    const start = isCurrent ? now - HOUR * (1 + rnd()) : now - day * DAY - (rnd() * 6 + 1) * HOUR;
    const length = HOUR * (0.7 + rnd() * 1.5);
    const end = isCurrent ? now : start + length;
    push('player-join', null, start, {dx: 2, dy: 0, dz: 2});

    const events = 25 + Math.floor(rnd() * 25);
    for (let e = 0; e < events; e++) {
      const at = start + (end - start) * ((e + 1) / (events + 1));
      const r = rnd();
      switch (player.behaviour) {
        case 'xray':
          // Прямые тоннели к алмазам на глубине: много руды, мало камня
          if (r < .55) push('block-break', 'deepslate_diamond_ore', at, {dx: 40, dy: 2, dz: 40});
          else if (r < .75) push('block-break', 'deepslate', at, {dx: 40, dy: 2, dz: 40});
          else if (r < .9) push('item-pickup', 'diamond', at, {dx: 40, dy: 2, dz: 40});
          else push('player-command', '/home', at);
          break;
        case 'thief':
          // Чужие сундуки на базе Steve_B
          if (r < .45) push('item-remove', ['diamond', 'iron_ingot', 'golden_apple', 'netherite_ingot'][Math.floor(rnd() * 4)], at,
              {target: 'сундук Steve_B', dx: 6, dy: 1, dz: 6});
          else if (r < .6) push('block-break', 'chest', at, {dx: 6, dy: 1, dz: 6});
          else if (r < .8) push('player-chat', ['привет', 'кто тут живёт?', 'я просто мимо', 'ничего не трогал'][Math.floor(rnd() * 4)], at);
          else push('item-drop', 'cobblestone', at);
          break;
        case 'pvp':
          if (r < .5) push('entity-death', 'player', at, {target: ['Steve_B', 'AlexM', 'NotchFan01', 'KateC'][Math.floor(rnd() * 4)], dx: 60, dz: 60});
          else if (r < .65) push('player-death', null, at, {dx: 60, dz: 60});
          else if (r < .8) push('item-pickup', 'diamond', at, {dx: 60, dz: 60});
          else push('player-chat', ['ez', 'gg', 'слабаки', '1v1?'][Math.floor(rnd() * 4)], at);
          break;
        case 'miner':
          if (r < .5) push('block-break', ['stone', 'deepslate', 'iron_ore', 'cobblestone'][Math.floor(rnd() * 4)], at, {dx: 30, dy: 6, dz: 30});
          else if (r < .58) push('block-break', 'diamond_ore', at, {dx: 30, dy: 3, dz: 30});
          else if (r < .75) push('block-place', 'torch', at, {dx: 30, dy: 6, dz: 30});
          else if (r < .9) push('item-pickup', 'iron_ore', at, {dx: 30, dy: 6, dz: 30});
          else push('entity-death', ['zombie', 'skeleton', 'creeper'][Math.floor(rnd() * 3)], at);
          break;
        default:
          if (r < .4) push('block-place', ['oak_planks', 'glass', 'stone', 'oak_log'][Math.floor(rnd() * 4)], at);
          else if (r < .6) push('block-break', ['dirt', 'oak_log', 'stone'][Math.floor(rnd() * 3)], at);
          else if (r < .72) push('item-insert', ['iron_ingot', 'bread', 'oak_log', 'diamond'][Math.floor(rnd() * 4)], at, {target: 'свой сундук', dx: 4, dy: 1, dz: 4});
          else if (r < .85) push('player-chat', ['всем привет', 'кто поможет с фермой?', 'го в незер', 'красиво получилось'][Math.floor(rnd() * 4)], at);
          else if (r < .93) push('entity-death', ['zombie', 'skeleton'][Math.floor(rnd() * 2)], at);
          else push('player-command', ['/home', '/spawn', '/tpa KateC'][Math.floor(rnd() * 3)], at);
      }
    }
    if (rnd() < .2) push('block-break', 'netherrack', start + length / 2, {world: 'world_nether', x: Math.round(bx / 8), y: 70, z: Math.round(bz / 8)});
    if (!isCurrent) push('player-quit', null, end, {dx: 2, dy: 0, dz: 2});
  }
  return out.sort((a, b) => b.at - a.at);
}

/**
 * Голова скина 8×8 для демо: кожа, волосы и глаза по нику. Настоящий skinHeadBase64 — PNG без `data:`;
 * демо-голова — SVG, поэтому сразу полным data-URL: parseImageBase64 пропускает такие как есть.
 */
function demoSkinHead(name, rnd) {
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const skin = pick(['#E0AC69', '#C68642', '#F1C27D', '#FFDBAC', '#8D5524']);
  const hair = pick(['#3E2723', '#212121', '#E65100', '#AD1457', '#B0BEC5', '#6D4C41', '#F9A825']);
  const eyes = pick(['#1E88E5', '#43A047', '#5E35B1', '#6A1B9A', '#00838F', '#D50000']);
  const mouth = '#7A4A2A';
  const rows = [
    [hair, hair, hair, hair, hair, hair, hair, hair],
    [hair, hair, hair, hair, hair, hair, hair, hair],
    [hair, skin, skin, skin, skin, skin, skin, hair],
    [skin, skin, skin, skin, skin, skin, skin, skin],
    [skin, '#FFFFFF', eyes, skin, skin, eyes, '#FFFFFF', skin],
    [skin, skin, skin, mouth, mouth, skin, skin, skin],
    [skin, skin, mouth, skin, skin, mouth, skin, skin],
    [skin, skin, mouth, mouth, mouth, mouth, skin, skin]
  ];
  const rects = rows.flatMap((row, y) => row.map((color, x) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`)).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">${rects}</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Демонстрационный источник. Тот же интерфейс будет у боевого.
 * Длительности — в мс; null — навсегда.
 * @returns {{players(): Promise<EyePlayer[]>, activities(uuid: string, filter?: EyeActivityFilter): Promise<EyeActivity[]>,
 *   complaints(uuid: string): Promise<EyeComplaint[]>,
 *   serverComplaints(filter?: {reviewed?: boolean}): Promise<EyeComplaint[]>,
 *   setComplaintReviewed(id: string, reviewed: boolean, by: string): Promise<EyeComplaint>,
 *   ban(uuid: string, ban: {reason: string, durationMs: number|null, byIp: boolean}, by: string): Promise<EyePlayer>,
 *   unban(uuid: string): Promise<EyePlayer>,
 *   mute(uuid: string, mute: {reason: string, durationMs: number|null}, by: string): Promise<EyePlayer>,
 *   unmute(uuid: string): Promise<EyePlayer>,
 *   kick(uuid: string, reason: string, by: string): Promise<EyePlayer>,
 *   markSuspect(uuid: string, note: string, by: string): Promise<EyePlayer>, clearSuspect(uuid: string): Promise<EyePlayer>}}
 */
export function createDemoEyeSource(serverId) {
  const now = Date.now();
  const rnd = random(serverId * 7919 + 17);
  const players = DEMO_PLAYERS.map((p) => {
    const uuid = uuidFor(p.name, rnd);
    const firstSeen = new Date(now - p.days * DAY - rnd() * DAY);
    return {
      uuid,
      name: p.name,
      skinHeadBase64: demoSkinHead(p.name, rnd),
      profileName: p.profileName,
      // На Pixplaze зарегистрировался раньше, чем зашёл на этот сервер
      profileRegisteredAt: p.profileName ? new Date(firstSeen.getTime() - (5 + rnd() * 200) * DAY) : null,
      isOperator: !!p.isOperator,
      online: p.online,
      firstSeen,
      lastSeen: new Date(p.online ? now : now - (1 + rnd() * 40) * HOUR),
      playtimeMs: Math.round(p.days * (0.6 + rnd()) * HOUR),
      ban: p.ban ? {reason: p.ban.reason, by: p.ban.by, at: new Date(now - p.ban.hoursAgo * HOUR), byIp: false,
        until: p.ban.days ? new Date(now - p.ban.hoursAgo * HOUR + p.ban.days * DAY) : null} : null,
      mute: null,
      suspect: p.suspect ? {note: p.suspect.note, by: p.suspect.by, at: new Date(now - p.suspect.hoursAgo * HOUR)} : null,
      behaviour: p.behaviour,
      base: p.base
    };
  });
  const journal = new Map(players.map(p => [p.uuid, generateActivities(p, random(p.uuid.charCodeAt(0) * 131 + serverId), now)]));
  const find = (uuid) => players.find(p => p.uuid === uuid);
  const byName = (name) => players.find(p => p.name === name);

  const complaints = DEMO_COMPLAINTS.map((c, i) => {
    const author = byName(c.author), accused = byName(c.accused);
    const own = journal.get(accused.uuid);
    const candidates = own.filter(a => a.action === c.pick);
    const base = candidates[Math.floor(rnd() * candidates.length)] ?? own[Math.floor(rnd() * own.length)];
    const at = new Date(Math.min(now - 60_000, base.at.getTime() + (3 + rnd() * 15) * 60_000));
    return {
      id: `complaint-${i}`, category: c.category, text: c.text, at,
      reviewed: c.reviewedBy ? {by: c.reviewedBy, at: new Date(Math.min(now, at.getTime() + 3 * HOUR))} : null,
      world: base.world, x: base.x + Math.round((rnd() - .5) * 10), y: base.y, z: base.z + Math.round((rnd() - .5) * 10),
      authorUuid: author.uuid, authorName: author.name, accusedUuid: accused.uuid, accusedName: accused.name
    };
  });
  // Жалоба — событие в журнале обоих: у обвиняемого «жалоба от», у автора «пожаловался на»
  for (const c of complaints) {
    const place = {world: c.world, x: c.x, y: c.y, z: c.z, at: c.at};
    journal.get(c.accusedUuid).push({id: `${c.id}-in`, playerUuid: c.accusedUuid, action: 'complaint-received',
      subject: c.authorName, target: c.category, ...place});
    journal.get(c.authorUuid).push({id: `${c.id}-out`, playerUuid: c.authorUuid, action: 'complaint-filed',
      subject: c.accusedName, target: c.category, ...place});
  }
  for (const list of journal.values()) list.sort((a, b) => b.at - a.at);
  for (const p of players) p.complaintsCount = complaints.filter(c => c.accusedUuid === p.uuid).length;

  const publicView = ({behaviour, base, ...p}) => p;
  const delay = (value) => new Promise(resolve => setTimeout(() => resolve(structuredClone(value)), 150));
  const until = (durationMs) => (durationMs == null ? null : new Date(Date.now() + durationMs));

  return {
    players: () => delay(players.map(publicView)),

    /** Все жалобы сервера; reviewed: false — только непросмотренные. Новые сверху. */
    serverComplaints: ({reviewed} = {}) => delay(complaints
        .filter(c => reviewed === undefined || !!c.reviewed === reviewed)
        .sort((a, b) => b.at - a.at)),

    /** Отметить жалобу просмотренной (by — модератор) или снять отметку. */
    setComplaintReviewed(id, reviewed, by) {
      const complaint = complaints.find(c => c.id === id);
      complaint.reviewed = reviewed ? {by, at: new Date()} : null;
      return delay(complaint);
    },

    /** Жалобы на игрока и от него, новые сверху. */
    complaints: (uuid) => delay(complaints
        .filter(c => c.accusedUuid === uuid || c.authorUuid === uuid)
        .sort((a, b) => b.at - a.at)),

    activities(uuid, filter = {}) {
      const list = (journal.get(uuid) ?? []).filter((a) =>
          (!filter.actions?.size || filter.actions.has(a.action))
          && (!filter.since || a.at >= filter.since)
          && (!filter.until || a.at <= filter.until)
          && (!filter.world || a.world === filter.world)
          && (!filter.near || (a.world === filter.near.world
              && Math.abs(a.x - filter.near.x) <= filter.near.radius
              && Math.abs(a.z - filter.near.z) <= filter.near.radius)));
      return delay(list);
    },

    ban(uuid, {reason, durationMs, byIp}, by) {
      const player = find(uuid);
      player.ban = {reason, by, at: new Date(), until: until(durationMs), byIp};
      player.online = false;
      return delay(publicView(player));
    },

    unban(uuid) {
      const player = find(uuid);
      player.ban = null;
      return delay(publicView(player));
    },

    mute(uuid, {reason, durationMs}, by) {
      const player = find(uuid);
      player.mute = {reason, by, at: new Date(), until: until(durationMs)};
      return delay(publicView(player));
    },

    unmute(uuid) {
      const player = find(uuid);
      player.mute = null;
      return delay(publicView(player));
    },

    kick(uuid) {
      const player = find(uuid);
      player.online = false;
      player.lastSeen = new Date();
      return delay(publicView(player));
    },

    markSuspect(uuid, note, by) {
      const player = find(uuid);
      player.suspect = {note, by, at: new Date()};
      return delay(publicView(player));
    },

    clearSuspect(uuid) {
      const player = find(uuid);
      player.suspect = null;
      return delay(publicView(player));
    }
  };
}
