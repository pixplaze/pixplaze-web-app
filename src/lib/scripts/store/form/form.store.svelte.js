import {isFormDataValid} from "$lib/scripts/service/form.service.js";

/**
 * Базовое реактивное состояние формы: поля ({@link data}) и производный
 * признак валидности ({@link isFormDataValid}). Конкретные формы наследуют
 * этот класс и при необходимости добавляют собственное состояние.
 */
export class FormStore {
  constructor(data) {
    this.data = $state(data);
    this.isFormDataValid = $derived(isFormDataValid(this.data));
  }
}