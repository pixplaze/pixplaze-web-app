import {redirect} from '@sveltejs/kit';

/**
 * /auth — это объединённый экран входа/регистрации без собственного содержимого.
 * Перенаправляем на конкретный режим, сохраняя query (inviteCode). Наличие
 * inviteCode подразумевает регистрацию, поэтому открываем sign-up.
 */
export function load({url}) {
  const mode = url.searchParams.has('inviteCode') ? 'sign-up' : 'sign-in';
  redirect(307, `/auth/${mode}${url.search}`);
}