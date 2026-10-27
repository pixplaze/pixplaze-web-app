/**
 * Откладывает вызов callback до паузы в `delay` мс; аргументы — от последнего {@link run},
 * последним аргументом callback получает AbortSignal.
 *
 * Завершается результатом только последний вызов `run`. Вытесненный новым `run` или
 * отменённый `cancel` — ошибкой AbortError: и пока ждёт таймера, и если callback уже идёт
 * (signal прерывает его запрос; не слушает signal — результат всё равно отбрасывается).
 */
export function createDebounce(callback, delay) {
  let timeoutId;
  let controller;
  let rejectPending; // промис, чей таймер ещё не сработал

  const cancel = () => {
    clearTimeout(timeoutId);
    controller?.abort();
    rejectPending?.(controller.signal.reason);
    rejectPending = null;
  };

  const run = (...args) => {
    cancel();
    const current = controller = new AbortController();

    return new Promise((resolve, reject) => {
      rejectPending = reject;
      timeoutId = setTimeout(async () => {
        rejectPending = null;
        try {
          const result = await callback(...args, current.signal);
          current.signal.throwIfAborted();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  };

  return { run, cancel };
}

export function createDistinctDebounce(callback, delay) {
  const debounce = createDebounce(callback, delay);

  let lastArgsJson = null;
  let lastResultPromise = null;

  const run = (...args) => {
    const currentArgsJson = JSON.stringify(args);

    if (currentArgsJson === lastArgsJson && lastResultPromise) {
      return lastResultPromise;
    }

    lastArgsJson = currentArgsJson;

    lastResultPromise = debounce.run(...args).catch((err) => {
      lastArgsJson = null;
      lastResultPromise = null;
      throw err;
    });

    return lastResultPromise;
  };

  const cancel = () => {
    lastArgsJson = null;
    lastResultPromise = null;
    debounce.cancel();
  };

  return { run, cancel };
}
