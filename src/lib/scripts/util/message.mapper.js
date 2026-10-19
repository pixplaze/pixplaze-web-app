/** Типы сообщений сервера (`MinecraftMessageInfo.Type` в ext-api). */
export const MESSAGE_TYPE = {
  CONSOLE: 'CONSOLE',
  CHAT: 'CHAT',
  JOIN: 'JOIN',
  QUIT: 'QUIT',
  DEATH: 'DEATH',
  BROADCAST: 'BROADCAST',
  SAY: 'SAY',
  ME: 'ME',
  WEB: 'WEB',
  REPLY: 'REPLY'
};

/** Сообщения собеседников — облачками в чате; остальные типы — события строкой. */
export const BUBBLE_TYPES = new Set([MESSAGE_TYPE.CHAT, MESSAGE_TYPE.WEB]);

/**
 * После ника в строке чата: коды форматирования, пробелы и один разделитель формата (`> `, `: `, ` » `).
 * Разделитель один, чтобы не съесть начало самого сообщения (`-5`, `:)`); коды перед текстом остаются.
 */
const AFTER_AUTHOR = /^(?:§[0-9a-fk-orx])*\s*(?:[>:»|\]-](?:§[0-9a-fk-orx])*\s*)?/i;

/** Управляющие последовательности ANSI (`ESC[…m` и прочие CSI): пока вырезаются, разбор отложен. */
const ANSI_SEQUENCE = /\u001b\[[0-9;?]*[A-Za-z]/g;

let nextId = 0;

/** Сообщение сокета (`MinecraftMessageInfo`) → модель: `id` — ключ для списка, уникален в пределах вкладки. */
export const mapMessage = m => ({
  id: ++nextId,
  type: m.type ?? null,
  author: m.author ?? null,
  authorUuid: m.authorUuid ?? null,
  text: (m.text ?? '').replace(ANSI_SEQUENCE, ''),
  time: m.timestamp != null ? new Date(m.timestamp) : null
});

/**
 * Текст облачка без автора (ник — в заголовке облачка). Текст `CHAT` — строка целиком в оформлении
 * сервера (`<§cSteve> привет`): отрезается всё до ника включительно и разделитель после него.
 * Префиксы формата до ника (ранг) уходят вместе с ним. Ника в тексте нет — текст как есть.
 */
export function chatBody({type, author, text}) {
  if (type !== MESSAGE_TYPE.CHAT || !author) return text;
  const at = text.indexOf(author);
  return at < 0 ? text : text.slice(at + author.length).replace(AFTER_AUTHOR, '');
}

/**
 * Строка сообщения для показа одной строкой (консоль, события чата) с `§`-кодами. Автор отдельным
 * полем, поэтому оформление по типу — здесь: `[Server] текст`, `* Steve машет`.
 */
export function formatMessageLine({type, author, text}) {
  switch (type) {
    case MESSAGE_TYPE.CONSOLE:
      return author ? `[${author}] ${text}` : text;
    case MESSAGE_TYPE.CHAT:
      // В тексте — строка целиком в оформлении сервера; без автора она, только если формат не применился
      return author && !text.includes(author) ? `<${author}> ${text}` : text;
    case MESSAGE_TYPE.SAY:
      return `[${author ?? 'Server'}] ${text}`;
    case MESSAGE_TYPE.ME:
      return `* ${author ?? 'Server'} ${text}`;
    case MESSAGE_TYPE.WEB:
      return author ? `[Web] <${author}> ${text}` : `[Web] ${text}`;
    default:
      // JOIN, QUIT, DEATH, BROADCAST, REPLY — текст уже готов
      return text;
  }
}
