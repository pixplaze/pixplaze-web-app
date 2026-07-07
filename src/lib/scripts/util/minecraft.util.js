// Карта стандартных цветов Minecraft в HEX
const COLOR_MAP = {
  '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
  '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
  '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
  'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF'
};

/**
 * Преобразует форматы [&x&9&d&f&f&0&0], [§x§9§d§f§f§0§0] или [&#9dff00] в чистый #9dff00
 */
function normalizeHex(raw) {
  if (raw.startsWith('&#')) {
    return raw.replace('&#', '#');
  }
  // Убираем все символы § и & и берем последние 6 символов
  const clean = raw.replace(/[§&]/g, '');
  return '#' + clean.substring(1).toLowerCase();
}

export function parseMinecraftText(text, trim) {
  if (!text) return [];

  const tokens = [];

  let currentColor = '#FFFFFF';
  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  let isStrikethrough = false;
  let isObfuscated = false;

  // Регулярное выражение теперь ловит и §, и & для:
  // 1. Каноничных HEX-кодов: ([§&]x(?:[§&][0-9a-fA-F]){6})
  // 2. Альтернативных HEX-кодов: (&#[0-9a-fA-F]{6})
  // 3. Обычных кодов форматирования: ([§&][0-9a-fk-orR])
  const regex = /([§&]x(?:[§&][0-9a-fA-F]){6}|&#[0-9a-fA-F]{6}|[§&][0-9a-fk-orR])/g;

  const parts = text.split(regex);

  // Текст до первого управляющего кода
  if (!trim && parts[0] || (trim && parts[0].replace(/\s/g, '').trim().length !== 0)) {
    tokens.push({
      text: parts[0],
      color: currentColor,
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      strikethrough: isStrikethrough,
      obfuscated: isObfuscated
    });
  }

  // Итерируемся по парам: [код, текст_после_кода]
  for (let i = 1; i < parts.length; i += 2) {
    const codeToken = parts[i];
    const nextText = parts[i + 1] || '';

    // Проверяем на HEX-цвет
    if (codeToken.startsWith('&#') || codeToken.match(/^[§&]x/)) {
      currentColor = normalizeHex(codeToken);
      // Смена цвета в Minecraft всегда сбрасывает стили форматирования
      isBold = isItalic = isUnderline = isStrikethrough = isObfuscated = false;
    } else {
      // Обычный короткий код форматирования или цвета
      const code = codeToken.charAt(1).toLowerCase();

      if (COLOR_MAP[code] !== undefined) {
        currentColor = COLOR_MAP[code];
        isBold = isItalic = isUnderline = isStrikethrough = isObfuscated = false;
      } else if (code === 'l') {
        isBold = true;
      } else if (code === 'o') {
        isItalic = true;
      } else if (code === 'n') {
        isUnderline = true;
      } else if (code === 'm') {
        isStrikethrough = true;
      } else if (code === 'k') {
        isObfuscated = true;
      } else if (code === 'r') {
        currentColor = '#FFFFFF';
        isBold = isItalic = isUnderline = isStrikethrough = isObfuscated = false;
      }
    }

    // Добавляем токен, только если после него реально есть текст
    if (!trim && nextText || (trim && nextText.replace(/\s/g, '').trim().length !== 0)) {
      tokens.push({
        text: nextText,
        color: currentColor,
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        strikethrough: isStrikethrough,
        obfuscated: isObfuscated
      });
    }
  }

  return tokens;
}