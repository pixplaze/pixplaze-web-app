import {createPrompt} from "$lib/scripts/prompt.js";
import {createWebSocket} from "$lib/scripts/api/ws.config.js"

/** Текст сообщения сокета (`event.data`): JSON-массив строк — как есть, иначе — одна строка. */
const __parseMessages = ({data}) => {
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Не JSON — обычная строка
  }
  return [String(data)];
}

export const createCommandPrompt = (host, path) => {
  // Схема — как у страницы: ws:// с https-страницы браузер заблокирует
  const ws = createWebSocket(host, path, location.protocol === 'https:' ? 'wss' : 'ws');
  const prompt = createPrompt([], {
    messagesCapacity: 100,
    historyCapacity: 20,
  });

  ws.onmessage = event => {
    const messages = __parseMessages(event);
    prompt.push(messages);
    handleOnMessage();
  };

  let handleOnMessage = () => {};

  return {
    set onupdate(func) {
      handleOnMessage = func;
    },
    ...ws,
    ...prompt
  }
}
