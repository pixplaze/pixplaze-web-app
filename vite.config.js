import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import {execSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

// Вывод git-команды или null, если git или .git недоступны.
const git = (args) => {
  try {
    return execSync(`git ${args}`, {stdio: ['ignore', 'pipe', 'ignore']}).toString().trim() || null;
  } catch {
    return null;
  }
};

// Версия сборки для AppVersion.svelte, та же форма, что у GET /info/version в web-api.
const appVersion = {
  commit: git('rev-parse --short HEAD'),
  tag: git('tag --points-at HEAD')?.split('\n')[0] ?? null,
  version: JSON.parse(readFileSync('package.json', 'utf8')).version,
  buildTime: new Date().toISOString()
};

export default defineConfig({
  server: {host: true}, // Making dev application accessible in LAN
  define: {__APP_VERSION__: JSON.stringify(appVersion)},
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
          if (file.endsWith('.svg') && !file.endsWith('sprite.svg')) {
            console.log('🔹 Regenerating sprite...');
            execSync('node scripts/generate-sprite.js', {stdio: 'inherit'});
          }
        });
      }
    },
    sveltekit()
  ]
});
