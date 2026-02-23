import fs from 'fs';
import path from 'path';
import {optimize} from 'svgo';

const iconsDir = path.resolve('resources/icons');
const output = path.resolve('static/icons/sprite.svg');

const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg') && !(f === 'sprite.svg'));

let symbols = '';

for (const file of files) {

  const name = path.basename(file, '.svg').replace('_', '-');;
  let content = fs.readFileSync(path.join(iconsDir, file), 'utf-8');

  // Убираем лишние <svg> теги
  content = content
      .replace(/<\?xml.*\?>/g, '')
      .replace(/<!DOCTYPE.*>/g, '')
      .replace(/<svg[^>]*>/, '')
      .replaceAll('fill="black"', 'fill="currentColor"')
      .replaceAll('stroke="black"', 'fill="currentColor"')
      .replace(/<\/svg>\n/, '');

  content = optimize(content, {
    multipass: true,
    plugins: [
      "preset-default",
      {
        name: "removeViewBox",
        active: false // важно оставить viewBox
      },
      {
        name: "cleanupIds",
        active: false // не ломаем id
      }
    ]
  }).data;

  symbols += `<symbol id="icon-${name}" viewBox="0 0 24 24">${content}</symbol>\n`;
}

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols}</svg>`;

fs.writeFileSync(output, sprite);
console.log('Sprite generated:', output);