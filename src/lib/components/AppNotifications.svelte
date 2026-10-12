<script>
  import Notice from '$lib/components/ui/Notice.svelte';
  import {appNotificationService} from '$lib/scripts/service/app.notification.service.js';
</script>

<!-- Внутри <header>: на десктопе выпадает вниз, на мобильном (шапка снизу) растёт вверх. -->
<div class="app-notifications" role="status" aria-live="polite">
  <Notice notices={appNotificationService.notifications}
          onClose={(id) => appNotificationService.close(id)}/>
</div>

<style>
  .app-notifications {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1;

    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: calc(var(--ui-spacing) / 2);
    width: min(400px, 100%);
    padding: calc(var(--ui-spacing) / 2);

    background: transparent;
    /* Прозрачная область не перехватывает клики по странице, только сами уведомления */
    pointer-events: none;
  }

  .app-notifications > :global(.notice) {
    pointer-events: auto;
  }

  @media screen and (max-width: 440px) {
    .app-notifications {
      top: auto;
      bottom: 100%;
      width: 100%;
      /* Новые — ближе к шапке, то есть снизу */
      flex-direction: column-reverse;
    }
  }
</style>
