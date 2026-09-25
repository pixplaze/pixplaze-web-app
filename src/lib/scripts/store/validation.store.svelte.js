import {LEVEL} from "$lib/scripts/util/notice.util.js";
import {createDebounce} from "$lib/scripts/util/utils.js";
import {untrack} from "svelte";

const isEmpty = (v) => v === '' || v === null || v === undefined;

export class ValidationStore {
  constructor(validateFn, initial = '') {
    this.initial = initial;
    this.value = $state(initial);
    this.isValid = $state(!isEmpty(initial));
    this.validationNotices = $state([]);
    this.validationClasses = $derived(computeClasses(this.validationNotices));

    const debounced = createDebounce(validateFn, 1000);

    $effect(async () => {
      const currentValue = this.value;

      await untrack(async () => {
        if (isEmpty(currentValue)) {
          debounced.cancel();
          this.validationNotices = [];
          this.isValid = false;
          return;
        }

        await debounced.run(currentValue);
      });
    });
  }
}

function computeClasses(notices) {
  return notices.map(n => n.level)
      .filter((v, i, s) => s.indexOf(v) === i && v !== LEVEL.INFO)
      .join(' ');
}

export const createValidationStore = (validateFn, initialValue = '') =>
    new ValidationStore(validateFn, initialValue);
