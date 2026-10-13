import {maxLevel} from "$lib/scripts/util/notice.util.js";

/**
 * База формы: поля ({@link Field}) и уведомления уровня формы (ошибка отправки и т.п.).
 * Конкретные формы наследуют класс рядом со своим компонентом и добавляют toRequest()
 * и собственное состояние.
 */
export class Form {
  notices = $state([]);

  /** @param {Record<string, import('./field.svelte.js').Field>} fields */
  constructor(fields) {
    this.fields = fields;
  }

  /** Форма валидна, когда валидны все её поля. */
  get isValid() {
    return Object.values(this.fields).every(field => field.isValid);
  }

  /** Самый серьёзный уровень уведомлений формы (для подсветки полей). */
  get level() {
    return maxLevel(this.notices);
  }

  pushNotice(notice) {
    this.notices.push(notice);
  }

  clearNotices() {
    this.notices = [];
  }
}
