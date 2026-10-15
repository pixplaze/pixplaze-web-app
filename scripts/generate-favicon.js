// Собирает static/favicon.ico из static/favicon.svg — для браузеров без поддержки SVG-иконок.
//
// Требования (иконка — пиксель-арт):
// 1. Один алгоритм для всех кадров — усреднение по площади: пиксель кадра — среднее клеток
//    исходника под ним с весом по площади перекрытия.
// 2. На размерах, кратных сетке (viewBox 48 × 48, координаты целые), каждый пиксель лежит внутри
//    одной клетки, поэтому кадры 48, 96, 144, 192, 240 совпадают с исходником пиксель в пиксель.
//    На 16 и 32 в пиксель попадает несколько клеток — края размываются; это цена совместимости,
//    пока нет отдельного рисунка на сетке 16.
// 3. Несколько кадров в одном ICO: 16, 32, 48, 96, 144, 192, 240.
// 4. Совместимость: кадры до 48 — 32-битный BMP (его читают и IE, и Windows XP; старые браузеры
//    берут из ICO только 16–48), кадры крупнее — PNG (Windows Vista+), иначе файл весит
//    полмегабайта несжатых пикселей.
// 5. На неподдерживаемом SVG (не прямоугольник, нецелая координата, сложная заливка) скрипт
//    падает с ошибкой, а не рисует неточно.
//
// Запуск: node scripts/generate-favicon.js

import {readFileSync, writeFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';

const SOURCE = 'static/favicon.svg';
const TARGET = 'static/favicon.ico';
const SIZES = [16, 32, 48, 96, 144, 192, 240];
/** Кадры не больше этого размера пишутся в BMP, крупнее — в PNG. */
const MAX_BMP_SIZE = 48;

const NAMED_COLORS = {black: '#000000', white: '#FFFFFF'};

const svg = readFileSync(SOURCE, 'utf8');
const grid = readGrid(svg);
const rects = [...svg.matchAll(/<path[^>]*>/g)].map(([tag]) => toRect(attr(tag, 'd'), attr(tag, 'fill')));
const cells = rasterize();

const frames = SIZES.map(size => {
  const rgba = resample(size);
  return {size, data: size <= MAX_BMP_SIZE ? bmp(size, rgba) : png(size, rgba)};
});
writeFileSync(TARGET, ico(frames));
console.log(`${TARGET}: ${frames.map(f => `${f.size}px (${f.data.length} B)`).join(', ')}`);

function attr(tag, name) {
  const value = tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
  if (value === undefined) throw new Error(`No ${name} in ${tag}`);
  return value;
}

/** Сторона сетки: viewBox квадратный, начинается с нуля и целый. */
function readGrid(svg) {
  const [minX, minY, width, height] = attr(svg.match(/<svg[^>]*>/)[0], 'viewBox').trim().split(/\s+/).map(Number);
  if (minX !== 0 || minY !== 0 || width !== height || !Number.isInteger(width)) {
    throw new Error(`Unsupported viewBox: ${minX} ${minY} ${width} ${height}`);
  }
  return width;
}

/** Путь → прямоугольник {x0, y0, x1, y1, rgb} с целыми координатами; иначе ошибка. */
function toRect(d, fill) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g);
  const points = [];
  let x = 0, y = 0, command;
  for (let i = 0; i < tokens.length;) {
    if (/[a-zA-Z]/.test(tokens[i])) command = tokens[i++];
    switch (command) {
      case 'M': case 'L': x = +tokens[i++]; y = +tokens[i++]; break;
      case 'H': x = +tokens[i++]; break;
      case 'V': y = +tokens[i++]; break;
      case 'Z': case 'z': continue;
      default: throw new Error(`Unsupported path command '${command}' in "${d}"`);
    }
    points.push([x, y]);
  }

  const xs = [...new Set(points.map(p => p[0]))];
  const ys = [...new Set(points.map(p => p[1]))];
  if (xs.length !== 2 || ys.length !== 2) throw new Error(`Path is not an axis-aligned rectangle: "${d}"`);
  if (![...xs, ...ys].every(Number.isInteger)) throw new Error(`Path is off the pixel grid: "${d}"`);

  const hex = NAMED_COLORS[fill] ?? fill;
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`Unsupported fill '${fill}'`);
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

  return {x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), rgb};
}

/** Клетки сетки: RGBA построчно сверху вниз; поздний прямоугольник перекрывает ранний, как в SVG. */
function rasterize() {
  const rgba = Buffer.alloc(grid * grid * 4);
  for (const {x0, y0, x1, y1, rgb} of rects) {
    for (let y = Math.max(0, y0); y < Math.min(grid, y1); y++) {
      for (let x = Math.max(0, x0); x < Math.min(grid, x1); x++) {
        rgba.set([...rgb, 255], (y * grid + x) * 4);
      }
    }
  }
  return rgba;
}

/** Кадр size × size: каждый пиксель — среднее клеток под ним с весом по площади; цвет — с весом альфы. */
function resample(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const ratio = grid / size;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x0 = px * ratio, x1 = (px + 1) * ratio, y0 = py * ratio, y1 = (py + 1) * ratio;
      let r = 0, g = 0, b = 0, a = 0;
      for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
        const coverY = Math.min(y + 1, y1) - Math.max(y, y0);
        for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
          const i = (y * grid + x) * 4;
          const alpha = coverY * (Math.min(x + 1, x1) - Math.max(x, x0)) * cells[i + 3] / 255;
          r += cells[i] * alpha; g += cells[i + 1] * alpha; b += cells[i + 2] * alpha; a += alpha;
        }
      }
      const pixel = a > 0
          ? [Math.round(r / a), Math.round(g / a), Math.round(b / a), Math.round(a / (ratio * ratio) * 255)]
          : [0, 0, 0, 0];
      rgba.set(pixel, (py * size + px) * 4);
    }
  }
  return rgba;
}

/** Кадр ICO в BMP: BITMAPINFOHEADER + BGRA снизу вверх + 1-битная маска прозрачности. */
function bmp(size, rgba) {
  const maskStride = Math.ceil(size / 32) * 4;
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8); // высота XOR и AND вместе
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(size * size * 4 + maskStride * size, 20);

  const pixels = Buffer.alloc(size * size * 4);
  const mask = Buffer.alloc(maskStride * size);
  for (let row = 0; row < size; row++) {
    const y = size - 1 - row;
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4, dst = (row * size + x) * 4;
      pixels.set([rgba[src + 2], rgba[src + 1], rgba[src], rgba[src + 3]], dst);
      if (rgba[src + 3] === 0) mask[row * maskStride + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return Buffer.concat([header, pixels, mask]);
}

/** Кадр ICO в PNG: RGBA 8 бит, без фильтров строк. */
function png(size, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8 бит, RGBA, deflate, без фильтра, без interlace

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);

  let offset = 6 + 16 * frames.length;
  const entries = frames.map(({size, data}) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size % 256, 0); // 0 означает 256
    entry.writeUInt8(size % 256, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...frames.map(frame => frame.data)]);
}
