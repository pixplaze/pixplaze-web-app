import {FormStore} from "$lib/scripts/store/form/form.store.svelte.js";

/**
 * Форма входа не нуждается в дополнительном состоянии сверх базового,
 * поэтому переиспользует FormStore напрямую.
 */
export const createSignInFormStore = (data) => new FormStore(data);