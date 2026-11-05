<script>
  /*
    TODO: Переделать вид вместе с дизайнером (облачка, события, аватары)
   */
  import {MessageStream} from '$scripts/messageStream.svelte.js';
  import MinecraftText from '$ui/text/MinecraftText.svelte';
  import {FORMATTER_WEEK_DAY_HM} from '$util/date.util.js';
  import {BUBBLE_TYPES, chatBody, formatMessageLine, MESSAGE_TYPE} from '$util/message.mapper.js';
  import ConsoleInput from "$components/console/ConsoleInput.svelte";

  /** Команды обычного игрока, которые принимает чат плагина (`ChatWebSocketController`). */
  const CHAT_COMMANDS = ['msg', 'tell', 'w', 'me', 'list', 'help'];
  /** Предел длины сообщения чата в Minecraft. */
  const MAX_LENGTH = 256;

  /**
   * Чат сервера: сообщения облачками, события строкой. serverId — чей токен доступа;
   * host — адрес плагина `host:port`;
   * fullscreen — на весь экран без хедера, иначе высоту задаёт родитель.
   */
  const {serverId, host, fullscreen = true} = $props();

  // svelte-ignore state_referenced_locally
  const stream = new MessageStream(serverId, host, 'chat', {label: 'чату сервера'});
  const formatTime = (time) => {
    return FORMATTER_WEEK_DAY_HM.format(time).toLowerCase();
  }

  let input;

  // Уход со страницы или смена активного сервера — закрываем подключение
  $effect(() => {
    stream.open();
    return () => stream.close();
  });
</script>

<div class="chat"
     class:fullscreen
     role="none"
     tabindex="-1"
     onclick={() => input.focus()}>
  <!-- column-reverse: прокрутка отсчитывается от низа — лента открывается на последних сообщениях и
       остаётся внизу при новых без JS; обёртка держит сообщения в обычном порядке -->
  <div class="messages">
    <div class="feed">
      {#each stream.messages as message (message.id)}
        {#if BUBBLE_TYPES.has(message.type)}
          <div class="message" class:own={stream.isOwnMessage(message.authorUuid)}>
            <div class="bubble">
              <div class="author">
                <MinecraftText text={message.author ?? 'Web'} ampersand={false}/>
              </div>
              <div class="text">
                <MinecraftText text={chatBody(message)} ampersand={false}/>
              </div>
            </div>
            <span class="time">{formatTime(message.time)}</span>
          </div>
        {:else}
          <div class="event" class:reply={message.type === MESSAGE_TYPE.REPLY}>
            <span class="time">{formatTime(message.time)}</span>
            <MinecraftText text={formatMessageLine(message)} ampersand={false}/>
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <div class="actionbar">
    <ConsoleInput bind:this={input}
                  predicates={CHAT_COMMANDS}
                  maxlength={MAX_LENGTH}
                  placeholder="Сообщение или /команда"
                  disabled={!stream.connected}
                  onsubmit={(line) => stream.send(line)}/>
  </div>
</div>

<style>
  .chat {
    position: relative;
    box-sizing: border-box;

    width: 100%;
    height: 100%;

    padding-bottom: var(--ui-height);

    background-color: var(--color-ui-foreground);
  }

  .chat.fullscreen {
    height: var(--ui-page-height);
  }

  .feed {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .messages {
    box-sizing: border-box;

    /* Обёртка прижата к низу: мало сообщений — они над полем ввода, много — прокрутка */
    display: flex;
    flex-direction: column-reverse;

    height: 100%;
    overflow-y: auto;

    padding: 10px 10px 24px;

    font-family: "Minecraft", "Arial", "sans-serif";
    line-height: 24px;
    color: var(--color-text-secondary);
    overflow-wrap: anywhere;
  }

  .message {
    display: flex;
    gap: var(--ui-spacing);
    align-self: flex-start;
  }

  .message.own {
    align-self: flex-end;
    flex-direction: row-reverse;

    .bubble {
      background-color: var(--color-ui-primary);
      border-color: var(--color-ui-border);
    }
  }

  .bubble {
    box-sizing: border-box;

    color: var(--color-text-secondary);

    max-width: 80%;
    padding: 6px 10px calc(6px + var(--ui-size-shadow));

    background-color: #555555;
    border: var(--ui-size-border) solid var(--color-ui-contrast-border);
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
  }

  .author,
  .text {
    color: inherit;
  }

  .author {
    font-size: 14px;
    opacity: .8;
  }

  /* Событие — на всю ширину, текст по центру */
  .time {
    width: min-content;
    text-wrap: wrap;
    word-wrap: normal;
    flex: 0 0 auto;
    font-family: "Minecraft", "Montserrat", "sans-serif";
    opacity: .3;
    align-self: flex-end;

    user-select: none;
  }

  .event {
    position: relative;
    box-sizing: border-box;
    color: var(--color-text-secondary);

    width: 100%;
    padding: 4px 10px;

    text-align: center;
    background-color: rgba(0, 0, 0, .2);

    .time {
      width: auto;
      flex: 0 0 auto;
      padding-left: 10px;
      padding-right: 10px;
      vertical-align: baseline;
      text-align: center;
    }
  }

  /* Ответ команды — только этому клиенту */
  .event.reply {
    font-style: italic;
    opacity: .7;
  }

  .actionbar {
    position: absolute;
    bottom: 0;
    width: 100%;
  }
</style>
