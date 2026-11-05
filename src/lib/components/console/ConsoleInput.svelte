<script>
  import {ConsoleInput} from '$components/console/ConsoleInput.svelte.js';
  import ButtonIcon from "$ui/buttons/ButtonIcon.svelte";

  /**
   * Поле ввода команд и сообщений с предикатом (см. {@link ConsoleInput}).
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
  const consoleInput = new ConsoleInput({defaultPredicate, predicates});

  let inputElement;
  const send = () => {
    if (disabled) return;
    const text = consoleInput.submit();
    if (text) onsubmit?.(text);
  }

  export function focus() {
    inputElement?.focus();
  }

  function onKeyDown(e) {
    // До изменения поля: Backspace в уже пустом поле
    if (e.key === 'Backspace' && consoleInput.input === '') {
      consoleInput.resetPredicate();
    }
  }

  function onKeyUp(e) {
    switch (e.key) {
      case 'Enter': {
        send();
        break;
      }
      case ' ':
        consoleInput.switchPredicate();
        break;
      case 'ArrowUp':
        consoleInput.previous();
        break;
      case 'ArrowDown':
        consoleInput.next();
        break;
    }
  }
</script>

<div class="command-input">
  {#if consoleInput.predicate}
    <div class="command-predicate">
      <span>/{consoleInput.predicate}</span>
    </div>
  {/if}
  <input type="text"
         name="command"
         bind:this={inputElement}
         bind:value={consoleInput.input}
         {disabled}
         {maxlength}
         autocomplete="off"
         autocorrect="off"
         autocapitalize="off"
         spellcheck="false"
         placeholder={disabled ? 'Подключение…' : placeholder}
         onkeydown={onKeyDown}
         onkeyup={onKeyUp}>
  <ButtonIcon title="Отправить" icon="send" onclick={send}/>
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
