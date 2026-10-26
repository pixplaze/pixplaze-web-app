<script>
  /**
   * Строка {@link ItemList}. Основная часть — `children`: с `onselect` это кнопка, без него — обычный блок,
   * внутри которого могут быть свои кнопки (например, PlayerRow с actions). `actions` — кнопки справа,
   * вне основной части, чтобы не вкладывать кнопку в кнопку. Выбранная строка (`selected`) помечается
   * aria-current, её вид задаёт использующий компонент.
   */
  const {onselect, selected = false, children, actions, classes} = $props();
</script>

<li>
  {#if onselect}
    <button type="button"
            class={['item-list-row', classes]}
            aria-current={selected || undefined}
            onclick={onselect}>
      {@render children?.()}
    </button>
  {:else}
    <div class={['item-list-row', classes]}>
      {@render children?.()}
    </div>
  {/if}
  {@render actions?.()}
</li>

<style>
  /* Разделитель — у строки, а не у основной части: идёт на всю ширину вместе с кнопками строки */
  li {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    border-top: var(--ui-size-border) solid var(--color-ui-shadow);
  }

  li:first-child {
    border-top-color: transparent;
  }

  .item-list-row {
    box-sizing: border-box;
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    height: var(--ui-size-block);
    color: inherit;
    padding: 0;
  }

  button {
    text-align: inherit;
    user-select: none;
    -webkit-user-drag: none;
    cursor: pointer;
    background-color: transparent;
    border: none;
  }

  button:active {
    background-color: var(--color-ui-shadow);
    box-shadow: inset 0 4px 0 0 var(--color-ui-shadow);
    transition: .2s ease;
  }
</style>
