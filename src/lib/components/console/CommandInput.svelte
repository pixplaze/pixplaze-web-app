<script>
  import {CommandLine} from '$components/console/CommandInput.svelte.js';

  /**
   * Поле ввода команд и сообщений с предикатом (см. {@link CommandLine}).
   * defaultPredicate — команда по умолчанию (консоль: `say`; чат: нет — сообщение);
   * predicates — команды, на которые можно переключиться (`null` — любые);
   * onsubmit(line) — строка для отправки: «/команда аргументы» или сообщение.
   */
  let {
    defaultPredicate = null,
    predicates = null,
    disabled = false,
    placeholder = '',
    maxlength = null,
    onsubmit
  } = $props();

  // svelte-ignore state_referenced_locally
  const line = new CommandLine({defaultPredicate, predicates});

  let inputElement;

  export function focus() {
    inputElement?.focus();
  }

  function onKeyDown(e) {
    // До изменения поля: Backspace в уже пустом поле
    if (e.key === 'Backspace' && line.input === '') {
      line.resetPredicate();
    }
  }

  function onKeyUp(e) {
    switch (e.key) {
      case 'Enter': {
        if (disabled) return;
        const text = line.submit();
        if (text) onsubmit?.(text);
        break;
      }
      case ' ':
        line.switchPredicate();
        break;
      case 'ArrowUp':
        line.previous();
        break;
      case 'ArrowDown':
        line.next();
        break;
    }
  }
</script>

<div class="command-input">
  {#if line.predicate}
    <div class="command-predicate">
      <span>/{line.predicate}</span>
    </div>
  {/if}
  <input type="text"
         name="command"
         bind:this={inputElement}
         bind:value={line.input}
         {disabled}
         {maxlength}
         autocomplete="off"
         autocorrect="off"
         autocapitalize="off"
         spellcheck="false"
         placeholder={disabled ? 'Подключение…' : placeholder}
         onkeydown={onKeyDown}
         onkeyup={onKeyUp}>
</div>

<style>
  .command-input {
    box-sizing: border-box;
    overflow: hidden;

    display: flex;

    width: 100%;
    height: var(--ui-height);

    box-shadow: 0 -4px 0 0 transparent;
    transition: box-shadow .3s ease;
  }

  .command-input:focus-within {
    box-shadow: 0 -4px 0 0 var(--color-main-shadow);
  }

  .command-predicate {
    display: flex;
    flex: 0 0 auto;

    min-width: var(--ui-size-block);
    height: 100%;

    background-color: #555555;

    padding-left: 10px;
    padding-right: 10px;
  }

  .command-predicate span {
    margin: auto;
  }

  .command-predicate span,
  input {
    font-family: "Minecraft", "Arial", "sans-serif";
    color: var(--color-text-secondary);
  }

  input {
    box-sizing: border-box;
    flex: 1 1 auto;
    min-width: 0;

    height: 100%;

    padding-left: var(--ui-padding);
    padding-right: var(--ui-padding);

    outline: none;
    border: none;
    background-color: transparent;

    line-height: 50px;

    color: var(--color-text-primary);
  }
</style>
