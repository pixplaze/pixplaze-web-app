<script>
  /*
    TODO: Реализовать запомнание историей предиката строки
     при этом не выводить его в input
    TODO: Исправить автоматическую прокрутку
    TODO: Вынести в методы обработку и форматирование ввода
    TODO: Реализовать глобальные стили для тёмных цветов и border/box-shadow
    TODO: Вынести длину переходов в глобальные переменные стилей
    TODO: Реализовать автоматическое переподключение к консоли сервера
   */
  import {onMount} from "svelte";
  import {createCommandPrompt} from "$lib/scripts/prompt.command.js";

  let prompt;
  let messages = [];
  let inputValue;
  let predicateValue = 'say'
  let focused = false;

  let promptMessagesElement;
  let promptInputElement;

  onMount(() => {
    prompt = createCommandPrompt();
    prompt.onpush(() => {
      messages = prompt.messages();

      // TODO: Фиксится добавлением высоты одной строки, напр getComputedStyle(document.documentElement).getPropertyValue('--my-variable-name')
      promptMessagesElement.scrollTop = promptMessagesElement.scrollHeight;

    });
    prompt.onenter(() => {
      prompt.send(formattedInput());
    });
    prompt.open();
  });

  function focus() {
    promptInputElement.focus();
    focused = true;
  }

  function blur() {
    focused = false;
  }

  function formattedInput() {
    return `${predicateValue} ${inputValue.trim()}`;
  }

  function parseInput(rawInputValue) {
    if (rawInputValue.startsWith('/')) {
      let formattedInputValue = rawInputValue.slice(1);
      let split = formattedInputValue.split(/\s/);

      formattedInputValue = split.slice(1).join(' ').trim();

      return {
        predicate: split[0],
        input: formattedInputValue
      };
    } else {
      return {
        predicate: null,
        input: rawInputValue
      }
    }
  }

  function applyValue(value) {
    if (!value) {
      inputValue = '';
      return;
    }

    const {predicate, input} = parseInput(value);
    predicateValue = predicate ? predicate : predicateValue;
    inputValue = input;
  }

  function handleEnterKey() {
    applyValue(inputValue)

    if (inputValue.trim().length !== 0) {
      prompt.enter(`/${formattedInput()}`); // TODO: Заменить на метод
    }

    inputValue = '';
  }

  function handleSpaceKey() {
    applyValue(inputValue);
  }

  function handleArrowUpKey() {
    applyValue(prompt.history().decrement());
  }

  function handleArrowDownKey() {
    applyValue(prompt.history().increment());
  }

  function onKeyUp(e) {
    const key = e.code;
    switch (key) {
      case 'Enter':
        handleEnterKey();
        break;
      case 'Space':
        handleSpaceKey();
        break;
      case 'ArrowUp':
        handleArrowUpKey();
        break;
      case 'ArrowDown':
        handleArrowDownKey();
        break;
    }
  }
</script>

<div class="prompt"
     role="none"
     tabindex="-1"
     class:focused
     on:click={focus}>
  <div class="prompt-messages"
       bind:this={promptMessagesElement}>
    {#each messages as message, i (i)}
      <span class="message-row">
        <pre>{message}</pre>
      </span>
    {/each}
    <span class="message-row hidden"></span>
  </div>

  <div class="prompt-actionbar">
    <div class="prompt-predicate">
      <span>/{predicateValue}</span>
    </div>
    <input type="text"
           class="prompt-input"
           bind:this={promptInputElement}
           bind:value={inputValue}
           on:keyup={onKeyUp}
           on:blur={blur}>
  </div>
</div>

<style>
  .prompt {
    position: relative;
    box-sizing: border-box;

    width: 100%;
    height: 300px;

    padding-bottom: var(--ui-interactive-height);

    /* TODO: Заменить на другие переменные */
    background-color: var(--color-text-primary);
    border: 4px solid #333333;
  }

  .prompt pre,
  .prompt span,
  .prompt input {
    font-family: "Minecraft", "Arial", "sans-serif";
    line-height: 24px;
    color: var(--color-text-secondary);
    text-wrap: initial;
  }

  .prompt-messages {
    box-sizing: border-box;

    height: 100%;
    overflow-y: auto;

    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 24px;
  }

  .prompt-actionbar {
    position: absolute;
    box-sizing: border-box;
    overflow: hidden;

    display: grid;
    grid-template-columns: auto 1fr;

    bottom: 0;
    width: 100%;
    height: var(--ui-interactive-height);

    /*border: var(--ui-interactive-border-width) solid transparent;*/
    box-shadow: 0 0 0 4px transparent;
    transition: box-shadow .3s ease;
  }

  .prompt.focused .prompt-actionbar {
    box-shadow: 0 0 0 4px var(--color-main-outline);
    /*border: var(--ui-interactive-border-width) solid var(--color-main-outline);*/
  }

  .prompt-predicate {
    display: flex;

    min-width: var(--ui-interactive-size);
    height: 100%;

    background-color: #555555;

    padding-left: 10px;
    padding-right: 10px;
  }

  .prompt-predicate span {
    margin: auto;
  }

  input.prompt-input {
    box-sizing: border-box;

    width: 100%;
    height: 100%;

    padding-left: var(--ui-interactive-padding);
    padding-right: var(--ui-interactive-padding);

    outline: none;
    border: none;
    background-color: transparent;

    line-height: 50px;

    color: yellow;
  }
</style>
