import {createPrompt} from "$lib/scripts/prompt.js";
import {createWebSocket} from "$lib/scripts/api/ws.config.js"

const __parseMessages = event => {
  try {
    return JSON.parse(event.data);
  } catch (err) {
    if (!(typeof event.data === 'string')) {
      throw new Error(err);
    }
    return [event.data];
  }
}

export const createCommandPrompt = (host, path) => {
  const ws = createWebSocket(host, path, 'ws');
  const prompt = createPrompt([], {
    messagesCapacity: 100,
    historyCapacity: 20,
  });

  ws.onmessage = event => {
    const messages = __parseMessages(event);
    prompt.push(messages);

    console.log(event.data);
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
