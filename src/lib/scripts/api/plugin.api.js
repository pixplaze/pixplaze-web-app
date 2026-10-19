import {pluginTokens} from '$lib/scripts/pluginTokens.svelte.js';

/**
 * REST плагина Pixplaze. Отдельный клиент, а не {@link ApiClient}: тот подставляет токен профиля,
 * а плагину уходит только токен доступа к плагину. На 401 токен обменивается заново и запрос
 * повторяется один раз.
 *
 * @param {number} serverId сервер, чей токен нужен
 * @param {string} host адрес плагина `host:port`
 * @param {string} path путь, например `/server/state`
 * @param {RequestInit} [options]
 */
export async function pluginRequest(serverId, host, path, options = {}) {
  const url = `${location.protocol}//${host}${path}`;
  const send = async () => {
    const {accessToken} = await pluginTokens.get(serverId);
    return fetch(url, {...options, headers: {...options.headers, Authorization: `Bearer ${accessToken}`}});
  };

  const response = await send();
  if (response.status !== 401) {
    return response;
  }
  pluginTokens.invalidate(serverId);
  return send();
}
