export const random = {
  choice: arr => arr[Math.floor(Math.random() * arr.length)]
}
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

export const classIf = (className, condition) => {
  return condition ? className : '';
}

/**
 * UUID v4. `crypto.randomUUID` доступен только в secure context (https/localhost),
 * поэтому на http-LAN/в Safari его нет — собираем из `crypto.getRandomValues`
 * (доступен и в insecure context), с деградацией до Math.random в крайнем случае.
 * @returns {string}
 */
export function randomUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40; // версия 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // вариант 10

  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
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

