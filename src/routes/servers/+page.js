import {api} from "$lib/scripts/api/api.config.js";

export const ssr = true

export const load = async () => {
  const res = await api.get('/servers');
  const servers = await res.json();
  return {servers};
}