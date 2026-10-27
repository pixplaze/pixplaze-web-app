<script>
  import MinecraftText from '$ui/text/MinecraftText.svelte';
  import {formatMessageLine, MESSAGE_TYPE} from '$util/message.mapper.js';

  /** Сообщения одной строкой каждое (консоль): модели `mapMessage`. */
  let {messages} = $props();
</script>

{#each messages as message (message.id)}
  <div class="message-row" class:reply={message.type === MESSAGE_TYPE.REPLY}>
    <!-- В консоли «&» — обычный символ, коды форматирования только «§» -->
    <MinecraftText text={formatMessageLine(message)} ampersand={false}/>
  </div>
{/each}

<style>
  .message-row {
    line-height: 24px;
    overflow-wrap: anywhere;
  }

  /* Ответ команды — только этому клиенту */
  .message-row.reply {
    font-style: italic;
    opacity: .7;
  }
</style>
