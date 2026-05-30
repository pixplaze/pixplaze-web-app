export const random = {
  choice: arr => arr[Math.floor(Math.random() * arr.length)]
}
// not working
export const sequence = () => {
  let i = 0;
  const inc = () => {
    return i++;
  };
  return {
    increment: inc
  };
}

export const createIdEnricher = () => {
  let i = 0;
  const increment = () => {
    return i++;
  };
  return item => ({id: increment(), ...item});
}

export function createDebounce(callback, delay) {
  let timeoutId;
  let abortController;
  let activeResolve;
  let activeReject;

  const run = (...args) => {
    clearTimeout(timeoutId);

    if (abortController) {
      abortController.abort();
    }

    // 3. Создаем новый Promise, который вернется из run
    return new Promise((resolve, reject) => {
      activeResolve = resolve;
      activeReject = reject;
      abortController = new AbortController();

      timeoutId = setTimeout(async () => {
        try {
          const result = await callback(...args, abortController.signal);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  };

  const cancel = () => {
    clearTimeout(timeoutId);
    if (abortController) abortController.abort();
  };

  return { run, cancel };
}

