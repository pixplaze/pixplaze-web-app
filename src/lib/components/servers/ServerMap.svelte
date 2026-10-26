<script>
  /**
   * Веб-карта сервера. address — адрес карты `host:port`;
   * fullscreen — на весь экран без хедера, иначе высоту задаёт родитель.
   */
  const {address, fullscreen = true} = $props();
</script>

<div class="server-map" class:fullscreen>
  <!-- Схема — как у страницы: http-карту на https-странице браузер заблокирует -->
  <iframe src={`${location.protocol}//${address}`}
          title="Server Map">
  </iframe>
</div>

<style>
  .server-map {
    box-sizing: border-box;

    width: 100%;
    height: 100%;
  }

  .server-map.fullscreen {
    height: var(--ui-page-height);
  }

  iframe {
    display: block;

    width: 100%;
    height: 100%;

    border: none;
  }
</style>
