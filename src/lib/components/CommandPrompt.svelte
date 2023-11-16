<script>
  import {onMount} from "svelte";
  import {createPrompt} from "$lib/scripts/prompt.js";

  let prompt;
  let messages = [];
  let promptInputValue;
  let predicate = 'say'
  let focused = false;

  let promptMessagesElement;
  let promptInputElement;

  onMount(() => {
    prompt = createPrompt(['pipka', 'titka', 'fasdfasd;fjas;dlfkj asdfjasd;lkfj k;asd\nfasdfja;sdlkfja;sldkfja;sldkfja;sldkfaghhrpqogihproeig\ngjwelgjwperogijweprogij'], {
      historyCapacity: 10,
      messagesCapacity: 100
    })

    prompt.onpush(() => {
      messages = prompt.messages();
      // TODO: Фиксится добавлением высоты одной строки, напр getComputedStyle(document.documentElement).getPropertyValue('--my-variable-name')
      promptMessagesElement.scrollTop = promptMessagesElement.scrollHeight;
    });

    prompt.onenter(() => {
      prompt.push(`${predicate} ${promptInputValue.trim()}`); // TODO: Заменить на метод
      promptInputValue = '';
    });

    messages = prompt.messages();
  });

  function focus() {
    promptInputElement.focus();
    focused = true;
    console.log('focused');
  }

  function blur() {
    focused = false;
    console.log('blurred');
  }

  function handleInput(rawInputValue) {
    if (!rawInputValue.startsWith('/')) return rawInputValue;

    let formattedInputValue = rawInputValue.slice(1);
    let split = formattedInputValue.split(/\s/);
    predicate = split[0];
    formattedInputValue = split.slice(1).join(' ');

    return formattedInputValue;
  }

  function onKeyUp(e) {
    const key = e.code;
    switch (key) {
      case 'Enter':
        promptInputValue = handleInput(promptInputValue);
        prompt.enter(`/${predicate} ${promptInputValue.trim()}`); // TODO: Заменить на метод
        break;
      case 'Space':
        promptInputValue = handleInput(promptInputValue);
        break;
      case 'ArrowUp':
        prompt.history().decrement();
        promptInputValue = prompt.history().peek();
        break;
      case 'ArrowDown':
        prompt.history().increment();
        promptInputValue = prompt.history().peek();
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
      <div class="message-row">
        <pre>{message}</pre>
      </div>
    {/each}
  </div>

  <div class="prompt-actionbar">
    <div class="prompt-predicate">
      <span>/{predicate}</span>
    </div>
    <input type="text"
           class="prompt-input"
           bind:this={promptInputElement}
           bind:value={promptInputValue}
           on:keyup={onKeyUp}
           on:blur={blur}>
  </div>
</div>

<style>
  .prompt {
    position: relative;

    width: 100%;
    height: 300px;

    padding-bottom: var(--ui-interactive-height);

    /* TODO: Заменить на другие переменные */
    background-color: var(--color-text-primary);
  }

  .prompt pre,
  .prompt span,
  .prompt input {
    font-family: "Minecraft", "Arial", "sans-serif";
    line-height: 24px;
    color: var(--color-text-secondary);
  }

  .prompt-messages {
    box-sizing: border-box;

    height: 100%;
    overflow-y: auto;

    padding: 10px 10px 0;
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
  }

  .prompt.focused .prompt-actionbar {
    box-shadow: 0 0 0 var(--ui-interactive-border-width) var(--color-main-outline);
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

  .prompt-input {
    box-sizing: border-box;

    width: 100%;
    height: 100%;

    padding-left: var(--ui-interactive-padding);
    padding-right: var(--ui-interactive-padding);

    outline: none;
    border: none;
    background-color: transparent;

    line-height: var(--ui-interactive-size) !important;

    color: yellow;
  }
</style>