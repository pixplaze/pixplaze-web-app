<script>
  import {MessageStream} from '$scripts/messageStream.svelte.js';
  import {formatMessageLine, MESSAGE_TYPE} from '$util/message.mapper.js';
  import MinecraftText from '$ui/text/MinecraftText.svelte';
  import ConsoleInput from '$components/console/ConsoleInput.svelte';

  /** Консоль сервера: лог и консольные команды. serverId — чей токен доступа; host — адрес плагина `host:port`. */
  const {serverId, host} = $props();

  // svelte-ignore state_referenced_locally
  const stream = new MessageStream(serverId, host, 'console', {label: 'консоли сервера'});
  const formatTime = (date) => {
    const y = String(date.getFullYear()).slice(-2);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');

    return `${y}.${m}.${d} ${h}:${min}.${s}`;
  }
  let input;

  $effect(() => {
    stream.open();
    return () => stream.close();
  });
</script>

<div class="console"
     role="none"
     tabindex="-1"
     onclick={() => input.focus()}>
  <!-- column-reverse: прокрутка отсчитывается от низа — лог открывается на последних строках и остаётся
       внизу при новых без JS; обёртка держит строки в обычном порядке -->
  <div class="messages">
    <div>
      {#each stream.messages as message (message.id)}
        <div class="row" class:reply={message.type === MESSAGE_TYPE.REPLY}>
          <!-- В консоли «&» — обычный символ, коды форматирования только «§» -->
          <span class="time">{formatTime(message.time)}</span>
          <MinecraftText text={formatMessageLine(message)} ampersand={false} classes="log"/>
        </div>
      {/each}
    </div>
  </div>

  <div class="console-actionbar">
    <ConsoleInput bind:this={input}
                  defaultPredicate="say"
                  disabled={!stream?.connected}
                  onsubmit={(line) => stream?.send(line)}/>
  </div>
</div>

<style>
  .console {
    position: relative;
    box-sizing: border-box;

    width: 100%;
    height: 300px;

    padding-bottom: var(--ui-height);

    /* TODO: Заменить на другие переменные */
    background-color: var(--color-ui-foreground);
  }

  .messages {
    box-sizing: border-box;

    display: flex;
    flex-direction: column-reverse;

    height: 100%;
    overflow-y: auto;

    font-family: "Minecraft", "Arial", "sans-serif";
    color: var(--color-text-primary);
    /* Светлый фон: явный §f белым не виден — красим основным цветом текста */
    --mc-white: var(--color-text-primary);
  }

  .console-actionbar {
    position: absolute;
    bottom: 0;
    width: 100%;
  }

  .row {
    display: flex;
    gap: 10px;
    line-height: 24px;
    overflow-wrap: anywhere;
  }

  /* Ответ команды — только этому клиенту */
  .row.reply {
    font-style: italic;
    opacity: .7;
  }

  .row .time {
    vertical-align: baseline;
    text-align: center;
    width: 100px;
    text-wrap: wrap;
    flex: 0 0 auto;
    font-family: "Minecraft", "Montserrat", "sans-serif";

    padding-bottom: 10px;
  }

  .row :global(.log) {
    padding-bottom: 10px;
  }
</style>
