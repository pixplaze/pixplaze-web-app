<script>
  import ActiveServerGate from '$lib/components/ActiveServerGate.svelte';
</script>

<ActiveServerGate type="MAP" unsupported="Карта недоступна: на сервере не установлен плагин Pixplaze">
  {#snippet children(address)}
    <!-- Схема — как у страницы: http-карту на https-странице браузер заблокирует -->
    <iframe src={`${location.protocol}//${address}`}
            title="Server Map"
            width="100%"
            height="100%">
    </iframe>
  {/snippet}
</ActiveServerGate>
