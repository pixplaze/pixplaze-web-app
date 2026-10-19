/**
 * Действие: держит прокрутку элемента внизу, когда меняется параметр (список сообщений).
 * `update` вызывается после обновления DOM, поэтому новые строки уже отрисованы.
 *
 * `<div use:autoscroll={messages}>`
 */
export function autoscroll(node) {
  const scroll = () => node.scrollTop = node.scrollHeight;
  scroll();
  return {update: scroll};
}
