import {error} from '@sveltejs/kit';
import {serversApi} from '$api/servers.api.js';

/** Сервер обязателен (нет — 404); история онлайна — нет: не загрузилась, и плитка графика просто не показывается. */
export const load = async ({params, fetch}) => {
  const [server, history] = await Promise.all([
    serversApi.get(params.id, fetch).catch(() => null),
    serversApi.history(params.id, 7, fetch).catch(() => null)
  ]);
  if (!server) {
    error(404, 'Сервер не найден');
  }
  return {server, history};
};
