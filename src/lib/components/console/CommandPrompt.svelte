<script>
  /*
    TODO: Реализовать глобальные стили для тёмных цветов и border/box-shadow
    TODO: Вынести длину переходов в глобальные переменные стилей
   */
  import {MessageStream} from '$lib/scripts/messageStream.svelte.js';
  import MessageList from '$lib/components/MessageList.svelte';
  import CommandInput from '$lib/components/CommandInput.svelte';

  /** Консоль сервера: лог и консольные команды. serverId — чей токен доступа; host — адрес плагина `host:port`. */
  const {serverId, host} = $props();

  // svelte-ignore state_referenced_locally
  const stream = new MessageStream(serverId, host, 'console', {label: 'консоли сервера'});

  let input;

  // Уход со страницы или смена активного сервера — закрываем подключение
  $effect(() => {
    stream.open();
    return () => stream.close();
  });
</script>

<div class="prompt"
     role="none"
     tabindex="-1"
     onclick={() => input.focus()}>
  <!-- column-reverse: прокрутка отсчитывается от низа — лог открывается на последних строках и остаётся
       внизу при новых без JS; обёртка держит строки в обычном порядке -->
  <div class="prompt-messages">
    <div>
      <MessageList messages={stream.messages}/>
    </div>
  </div>

  <div class="prompt-actionbar">
    <CommandInput bind:this={input}
                  defaultPredicate="say"
                  disabled={!stream.connected}
                  onsubmit={(line) => stream.send(line)}/>
  </div>
</div>

<style>
  .prompt {
    position: relative;
    box-sizing: border-box;

    width: 100%;
    height: 300px;

    padding-bottom: var(--ui-height);

    /* TODO: Заменить на другие переменные */
    background-color: var(--color-ui-foreground);
  }

  .prompt-messages {
    box-sizing: border-box;

    display: flex;
    flex-direction: column-reverse;

    height: 100%;
    overflow-y: auto;

    padding: 0 10px 24px;

    font-family: "Minecraft", "Arial", "sans-serif";
    color: var(--color-text-primary);
    /* Светлый фон: явный §f белым не виден — красим основным цветом текста */
    --mc-white: var(--color-text-primary);
  }

  .prompt-actionbar {
    position: absolute;
    bottom: 0;
    width: 100%;
  }
</style>
