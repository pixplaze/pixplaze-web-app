<script>
  /**
   * Список строк: основная часть — кнопка (onselect), справа — необязательные кнопки строки
   * (actions), вне основной, чтобы не вкладывать кнопку в кнопку. Выбранная строка помечается
   * aria-current, её вид задаёт использующий компонент.
   */
  const {items = [], onselect, children, actions, selected, key} = $props();
</script>

<ul class="item-list">
  {#each items as item, index (key ? key(item) : index)}
    <li>
      <button type="button" aria-current={selected?.(item) || undefined} onclick={() => onselect?.(item)}>
        {@render children(item)}
      </button>
      {@render actions?.(item)}
    </li>
  {/each}
</ul>

<style>
  ul {
    color: var(--color-text-primary);
    background-color: var(--item-list-background, var(--color-ui-foreground));
    border: var(--ui-size-border) solid var(--color-ui-shadow);
    border-top: none;
    border-bottom: none;
  }

  /* Разделитель — у строки, а не у кнопки: идёт на всю ширину вместе с кнопками строки */
  li {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    border-top: var(--ui-size-border) solid var(--color-ui-shadow);
  }

  li:first-child {
    border-top-color: transparent;
  }

  button {
    box-sizing: border-box;
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    height: var(--ui-size-block);
    padding: 0 0 0 var(--ui-padding);

    color: inherit;
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
