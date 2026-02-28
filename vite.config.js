import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import {execSync} from 'node:child_process';

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
