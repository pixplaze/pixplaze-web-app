<script>
  import {infoApi} from '$lib/scripts/api/info.api.js';

  /* global __APP_VERSION__ */
  // Версия web-app вшивается на сборке (vite.config.js), та же форма, что у GET /info/version
  const app = __APP_VERSION__;
  let apiVersion = $state(null);

  $effect(() => {
    // API недоступен — колонка API остаётся с прочерками.
    infoApi.fetchVersion().then((v) => apiVersion = v).catch(() => {});
  });

  // Тега нет — показываем версию из pom.xml / package.json.
  const tag = (v) => v?.tag ?? v?.version;

  /** ISO-время → «дд.мм чч:мм» по локальному времени браузера. */
  const formatTime = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const rows = $derived([
    {app: app.commit, api: apiVersion?.commit},
    {app: tag(app), api: tag(apiVersion)},
    {app: formatTime(app.buildTime), api: formatTime(apiVersion?.buildTime)}
  ]);
</script>

<table class="app-version">
  <thead>
    <tr><th>APP</th><th>API</th></tr>
  </thead>
  <tbody>
    {#each rows as row}
      <tr><td>{row.app ?? '—'}</td><td>{row.api ?? '—'}</td></tr>
    {/each}
  </tbody>
</table>

<style>
  .app-version {
    background-color: transparent;
    border-collapse: separate;
    border-spacing: 0;
    padding: var(--ui-padding);
    font-size: 12px;
    color: var(--color-ui-shadow);
    user-select: text;
  }

  th, td {
    padding: 0 8px 0 0;
    border: none;
    text-align: left;
    font-weight: normal;
    white-space: nowrap;
  }
</style>
