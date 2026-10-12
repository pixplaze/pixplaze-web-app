import {LEVEL} from "$lib/scripts/util/notice.util.js";
import {untrack} from "svelte";

/**
 * Состояние поля с валидацией. При каждом изменении {@link value} сразу зовёт
 * {@link onChange}: проверку и показ результата решает сервис. Если задан
 * {@link dependsOn}, его изменение тоже вызывает onChange с текущим значением.
 */
export class ValidationStore {
  constructor(onChange, initial = '', dependsOn = null) {
    this.initial = initial;
    this.value = $state(initial);
    this.isValid = $state(false);
    this.validationNotices = $state([]);
    this.validationClasses = $derived(computeClasses(this.validationNotices));

    $effect(() => {
      const currentValue = this.value;
      dependsOn?.();
      untrack(() => onChange(currentValue));
    });
  }
}

function computeClasses(notices) {
  return notices.map(n => n.level)
      .filter((v, i, s) => s.indexOf(v) === i && v !== LEVEL.INFO)
      .join(' ');
}
