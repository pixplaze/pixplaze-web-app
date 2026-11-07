export function temp(initial, time) {
  let active = $state(initial);
  let timeoutId = null;

  return {
    get value() {
      return active;
    },
    set value(newValue) {
      active = newValue;

      if (timeoutId) clearTimeout(timeoutId);

      if (active !== initial) {
        timeoutId = setTimeout(() => {
          active = initial; // сбрасываем к исходному (false)
        }, time);
      }
    }
  };
}
