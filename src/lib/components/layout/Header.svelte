<script>
  import ButtonIcon from "$ui/buttons/ButtonIcon.svelte";

  /**
   * Слева — меню (стрелка поворачивается, когда панель открыта), посередине — поиск и друзья,
   * справа — чат и карта выбранного сервера (только если сервер выбран в избранном) и избранное.
   */
  const {
    onButtonAside,
    onButtonMap,
    onButtonSearch,
    onButtonChat,
    onButtonFriends,
    onButtonFavorite,
    asideExpanded = false,
    showServerButtons = false,
    showFavorite = false
  } = $props();
</script>

<div class="header">
  <div class="header-left">
    <ButtonIcon icon="chevron-right"
                title={asideExpanded ? "Скрыть меню" : "Меню"}
                classes="transparent aside-toggle {asideExpanded ? 'expanded' : ''}"
                onclick={onButtonAside}/>
  </div>
  <nav>
    <ButtonIcon icon="search"
                title="Поиск серверов"
                classes="transparent"
                onclick={onButtonSearch}/>
    <ButtonIcon icon="people"
                title="Друзья"
                classes="transparent"
                onclick={onButtonFriends}/>
  </nav>
  <div class="header-right">
    {#if showServerButtons}
      <ButtonIcon icon="chat"
                  title="Чат сервера"
                  classes="transparent"
                  onclick={onButtonChat}/>
      <ButtonIcon icon="map"
                  title="Карта сервера"
                  classes="transparent"
                  onclick={onButtonMap}/>
    {/if}
    {#if showFavorite}
      <ButtonIcon icon="heart"
                  title="Избранные серверы"
                  classes="transparent"
                  onclick={onButtonFavorite}/>
    {:else}
      <!-- Место кнопки сохраняем, чтобы навигация не съезжала при входе и выходе. -->
      <div class="header-placeholder"></div>
    {/if}
  </div>
</div>

<style>
  /* Высота — --ui-header-height: на десктопе шапка толще блока, кнопки квадратные в её высоту */
  .header {
    display: flex;
    justify-content: space-between;
    height: var(--ui-header-height);
    background-color: var(--color-ui-primary);
    border-bottom: 2px solid var(--color-green-deep);
    box-sizing: border-box;
  }

  .header>* {
    flex: 0 0 0;
  }

  nav,
  .header-right {
    display: flex;
    gap: 8px;
  }

  /* Левая и правая группы одинаково тянутся, поэтому средняя стоит ровно по центру */
  .header-left,
  .header-right {
    display: flex;
    flex: 1 1 0;
  }

  .header-right {
    justify-content: flex-end;
  }

  .header :global(.aside-toggle svg) {
    transition: transform .15s ease-out;
  }

  .header :global(.aside-toggle.expanded svg) {
    transform: rotate(180deg);
  }

  .header :global(button.button.ui.interactive.square) {
    width: var(--ui-header-height);
    height: calc(var(--ui-header-height) - 2px);
    min-height: 0;
    border-radius: var(--ui-radius);
  }

  .header :global(button.button svg.icon) {
    width: 32px;
    height: 32px;
  }

  .header-placeholder {
    flex: 0 0 var(--ui-header-height);
  }

  @media screen and (max-width: 440px) {
    .header {
      border-bottom: none;
      border-top: 2px solid var(--color-green-deep);
    }

    nav,
    .header-right {
      gap: 0;
    }

    .header :global(button.button svg.icon) {
      width: 24px;
      height: 24px;
    }
  }
</style>