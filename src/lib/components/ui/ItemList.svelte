<script>
  /**
   * Список строк: рамка, фон и разделители. Строки — {@link ItemListRow} в `children`, каждая со своим
   * содержимым и поведением. Фон задаётся переменной `--item-list-background`.
   */
  const {children} = $props();
</script>

<ul class="item-list">
  {@render children?.()}
</ul>

<style>
  ul {
    color: var(--color-text-primary);
    background-color: var(--item-list-background, var(--color-ui-foreground));
    border: var(--ui-size-border) solid var(--color-ui-shadow);
    border-top: none;
    border-bottom: none;
  }
</style>
