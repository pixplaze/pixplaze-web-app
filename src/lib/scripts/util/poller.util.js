const ABORTED = Symbol('aborted');

export class PollerTimeoutError extends Error {
    constructor(timeout) {
        super(`Request timed out after ${timeout} ms`);
        this.name = 'PollerTimeoutError';
        this.timeout = timeout;
    }
}

export function createPoller({
    request,
    period,
    timeout = 10_000,
    retries = 5,
    retryBaseDelay = 1_000,
    maxRetryDelay = 30_000,
    onGaveUp = () => {}

}) {
  if (typeof request !== 'function') {
    throw new TypeError('request must be a function');
  }

  if (typeof onGaveUp !== 'function') {
    throw new TypeError('onGaveUp must be a function');
  }

  for (const [name, value] of Object.entries({
    period,
    timeout,
    retryBaseDelay,
    maxRetryDelay
  })) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`${name} must be greater than 0`);
    }
  }

  if (!Number.isInteger(retries) || retries < 0) {
    throw new RangeError('retries must be a non-negative integer');
  }

  let timer;
  let controller;

  let running = false;
  let generation = 0;
  let retryCount = 0;
  let gaveUp = false;

  function stop() {
    running = false;
    generation++;

    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }

    if (controller) {
      const activeController = controller;
      controller = undefined;
      activeController.abort();
    }

    console.log('Poller was unmounted...');
  }

  function schedule(delay, currentGeneration) {
    timer = setTimeout(() => {
      timer = undefined;
      void execute(currentGeneration);
    }, delay);
  }

  function failPermanently(error) {
    if (gaveUp) return;

    gaveUp = true;
    stop();
    onGaveUp(error);
  }

  async function execute(currentGeneration) {
    if (!running || currentGeneration !== generation) {
      return;
    }

    const currentController = new AbortController();
    controller = currentController;

    let timeoutId;
    let abortHandler;

    // Позволяет завершить execute сразу после stop(),
    // даже если request не реагирует на AbortSignal.
    const abortPromise = new Promise(resolve => {
      abortHandler = () => resolve(ABORTED);

      currentController.signal.addEventListener(
        'abort',
        abortHandler,
        { once: true }
      );
    });

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new PollerTimeoutError(timeout);

        // Сначала фиксируем таймаут как ошибку,
        // затем прерываем запрос.
        reject(error);
        currentController.abort();
      }, timeout);
    });

    try {
      const result = await Promise.race([
        Promise.resolve().then(() => request(currentController.signal)),
        timeoutPromise,
        abortPromise
      ]);

      if (
        result === ABORTED ||
        !running ||
        currentGeneration !== generation ||
        currentController.signal.aborted
      ) {
        return;
      }

      // Успех сбрасывает счётчик повторных попыток.
      retryCount = 0;

      // Интервал отсчитывается от завершения запроса.
      schedule(period, currentGeneration);
    } catch (error) {
      if (!running || currentGeneration !== generation) {
        return;
      }

      // Обычная отмена — не ошибка.
      // Таймаут, несмотря на abort(), остаётся ошибкой.
      if (
        currentController.signal.aborted &&
        !(error instanceof PollerTimeoutError)
      ) {
        return;
      }

      if (retryCount >= retries) {
        failPermanently(error);
        return;
      }

      retryCount++;

      const delay = Math.min(
        retryBaseDelay * 2 ** (retryCount - 1),
        maxRetryDelay
      );

      schedule(delay, currentGeneration);

    } finally {
      clearTimeout(timeoutId);

      currentController.signal.removeEventListener(
        'abort',
        abortHandler
      );

      if (controller === currentController) {
        controller = undefined;
      }
    }
  }

  function start(delay) {
    if (running) return;

    running = true;
    retryCount = 0;
    gaveUp = false;

    const currentGeneration = ++generation;

    if (delay && delay > 0) {
      console.log('first:',delay)
      schedule(delay, currentGeneration);
    } else {
      void execute(currentGeneration);
    }
  }

  return {
    start,
    stop,

    get giveUp() {
      return gaveUp;
    }
  };
}