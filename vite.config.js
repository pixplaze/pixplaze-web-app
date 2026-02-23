import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import {execSync} from 'node:child_process';
// import {createSvgIconsPlugin} from 'vite-plugin-svg-icons';
// import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'generate-sprite',
      buildStart() {
        console.log('🔹 Generating SVG sprite...');
        execSync('node scripts/generate-sprite.js', {stdio: 'inherit'});
      },
      configureServer(server) {
        // автогенерация при изменении SVG в dev
        server.watcher.on('change', (file) => {
          if (file.endsWith('.svg') && !(file === 'sprite.svg')) {
            console.log('🔹 Regenerating sprite...');
            execSync('node scripts/generate-sprite.js', {stdio: 'inherit'});
          }
        });
      }
    },
    // createSvgIconsPlugin({
    //   iconDirs: [path.resolve(process.cwd(), './static/svg')],
    //   symbolId: 'icon-[name]',
    //   inject: 'body-last',
    //   svgoOptions: {
    //     multipass: true,
    //     plugins: [
    //       { name: 'preset-default', active: false },
    //       { name: 'removeAttrs', params: { attrs: '(stroke|style)' } }, // не трогаем fill
    //       { name: 'removeTitle', active: true },
    //       { name: 'removeViewBox', active: false }, // сохраняем viewBox
    //       { name: 'cleanupAttrs', active: false }, // не удаляем важные атрибуты
    //       { name: 'convertShapeToPath', active: false }, // не перекодируем path
    //       { name: "convertPathData", active: false },
    //       { name: "mergePaths", active: false },
    //       { name: "removeOffCanvasPaths", active: false },
    //       { name: "reusePaths", active: false },
    //       { name: "convertColors", active: false },
    //       { name: "collapseGroups", active: false },
    //       { name: "removeEmptyContainers", active: false },
    //       { name: 'removeUnknownsAndDefaults', active: false }, // не убираем fill-rule/clip-rule
    //       { name: 'removeUselessStrokeAndFill', active: false } // оставляем fill
    //     ]
    //   }
    // }),
    sveltekit()
  ]
});
