<script>
  let {
    mode = $bindable(),
    onSwitch,
    children
  } = $props();

  let ref = $state();
  let lastButton = null;

  // Навешиваем реактивный эффект для управления состоянием DOM-кнопок
  $effect(() => {
    if (!ref) return;
    if (lastButton) lastButton.removeAttribute('disabled');
    const selectedButton = ref.querySelector(`[data-id="${mode}"]`);

    selectedButton?.setAttribute('disabled', '');
    lastButton = selectedButton;
  });

  // Перехватываем клик на уровне контейнера
  function handle(event) {
    const button = event.target.closest('[data-id]');
    if (!button) return;

    const nextMode = button.getAttribute('data-id');
    if (nextMode && nextMode !== mode) {
      mode = nextMode;
      onSwitch?.(nextMode);
    }
  }
</script>

<div bind:this={ref}
     onclick={handle}
     class="button-switcher"
     role="toolbar"
     tabindex="-1"
>
  {@render children()}
</div>

<style>
  .button-switcher {
    box-sizing: border-box;
    display: flex;
  }

  :global {
    @media screen and (max-width: 440px) {
      .button-switcher button.button.icon {
        font-size: 0;
      }
    }
  }
</style>