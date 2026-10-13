import {error} from '@sveltejs/kit';
import {serversApi} from '$lib/scripts/api/servers.api.js';

// Листинг рендерится на сервере ради SEO, несмотря на SPA-режим остального приложения.
export const ssr = true

export const load = async ({fetch}) => {
  try {
    return {servers: await serversApi.list(fetch)};
  } catch {
    // 503, а не пустой список: поисковик не проиндексирует пустой листинг и зайдёт позже
    error(503, 'Сервис временно недоступен');
  }
}
