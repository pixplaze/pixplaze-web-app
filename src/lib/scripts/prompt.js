function concatWithCapacity(firstArray, secondArray, capacity) {
  const newLength = firstArray.length + secondArray.length;
  const overflow = newLength - capacity;

  if (overflow <= 0) {
    return firstArray.concat(secondArray);
  } else if (overflow > firstArray.length) {
    return secondArray.slice(overflow - firstArray.length);
  } else {
    return firstArray.slice(overflow).concat(secondArray);
  }
}

/**
 * If the length of messages array with the pushed string array together is greater
 * than the messageCapacity array will be sliced from start to fill in length,
 * old messages will be dropped.
 *
 * If the length of history array with the entered string value together is greater
 * than the historyCapacity array will be sliced from start to fill in length,
 * old history will be dropped.
 *
 * @param rows
 * @param options
 * @returns {{clear: (function(): *[]), messages: (function(): *[]), renew: *, enter: *, history: (function(): {decrement: function(): number, reset: function(): number, increment: function(): number, list: function(): *, peek: function(): *}), push: *}}
 */
const createPrompt = (rows, options) => {
  const config = {
    historyCapacity: options.historyCapacity || 20,
    messagesCapacity: options.messagesCapacity || 100,
  }

  let messages = [...rows];
  let handleOnPush = () => {};
  let handleOnEnter = () => {};
  const history = {
    index: 0,
    lines: []
  };

  return {
    messages: () => [...messages],
    clear: () => messages = [],
    push: rows => {
      if (!(Array.isArray(rows) || typeof rows === 'string')) throw new Error('Only string array or flat string value can be pushed in display messages!')
      if (typeof rows === 'string') rows = [rows.trim()]
      messages = concatWithCapacity(messages, rows, config.messagesCapacity);
      handleOnPush();
    },
    renew: rows => {
      if (!(Array.isArray(rows) || typeof rows === 'string')) throw new Error('Only string array or flat string value can be pushed in display messages!');
      if (typeof rows === 'string') rows = [rows]
      messages = concatWithCapacity(rows, [], config.messagesCapacity);
    },
    enter: row => {
      if (!(typeof row === 'string')) throw new Error('String value only can be entered in the prompt!');
      if (!row.trim()) return;
      history.lines =  concatWithCapacity(history.lines, [row], config.historyCapacity);
      history.index = history.lines.length;
      handleOnEnter();
    },
    onpush: func => {
      handleOnPush = func;
    },
    onenter: func => {
      handleOnEnter = func;
    },
    history: () => ({
      reset: () => history.index = history.lines.length - 1,
      increment: () => history.index < history.lines.length ? history.index++ : history.index,
      decrement: () => history.index > 0 ? history.index-- : history.index,
      list: () => [...history.lines],
      peek: () => history.lines[history.index] // TODO: RETURN LAST ON history.index === history.lines.length - 1
    })
  }
}

export {createPrompt};
