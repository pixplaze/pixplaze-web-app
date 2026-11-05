import fs from 'fs';
import path from 'path';
import {optimize} from 'svgo';

// const file = files.find(() => true) ?? null;
// console.log(file?.path);

function getFilesFromDir(directory) {
  const filePaths = fs.readdirSync(directory)
      .filter(f => f.endsWith('.svg') && !(f === 'sprite.svg'))
      .map(file => path.join(directory, file));

  if (filePaths.length === 0) {
    // throw new Error('No matching files found at \'' + directory + '\'!');
    console.warn('No matching files found at \'' + directory + '\'!');
    return [];
  }

  return filePaths;
}

function buildSprite(files, {prefix, size}) {
  let symbols = '';
  let width = size || 24;
  let height = size || 24;

  prefix = prefix ? prefix + '-' : '';

  for (const file of files) {

    const name = path.basename(file, '.svg').replace('_', '-');
    let content = fs.readFileSync(file, 'utf-8');
    let viewBox= `0 0 ${width} ${height}`;
    const viewBoxMatch = content.match(/viewBox=(["'])(.*?)\1/);

    if (viewBoxMatch) {
      viewBox = viewBoxMatch[2];
    }

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

    symbols += `  <symbol id="${prefix}${name}" viewBox="${viewBox}">${content}</symbol>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols}</svg>`;
}

const iconsDirPath = path.resolve('resources/icons');
const iconSpritePath = path.resolve('static/icons/sprite.svg');
const iconFilePaths = getFilesFromDir(iconsDirPath);
const iconSprite = buildSprite(iconFilePaths, {});

fs.writeFileSync(iconSpritePath, iconSprite);
console.log('Icon sprite generated:', iconSpritePath);

const imageDirPath = path.resolve('resources/images');
const imageSpritePath = path.resolve('static/images/sprite.svg');
const imagesFilePaths = getFilesFromDir(imageDirPath);
const imageSprite = buildSprite(imagesFilePaths, {size: 48});

fs.writeFileSync(imageSpritePath, imageSprite);
console.log('Image sprite generated:', imageSpritePath);