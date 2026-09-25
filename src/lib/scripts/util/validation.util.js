import {
  check,
  checkAsync,
  email,
  ip,
  maxLength,
  minLength,
  nonEmpty,
  pipe,
  pipeAsync,
  regex,
  string,
  trim, union
} from "valibot";
import {voucherService} from "$lib/scripts/service/voucher.service.js";

/**
 * Переиспользуемые valibot-схемы валидации полей форм.
 * Каждая схема — фабрика, возвращающая независимый экземпляр: это позволяет
 * безопасно делиться логикой между формами (sign-up, sign-in, ...) и
 * параметризовать схемы, которым нужен внешний контекст (например, повтор пароля).
 */

/** Минимальная схема: значение обязательно (непустая строка). */
export const requiredSchema = (message = 'Поле обязательно для заполнения') => pipe(
    string(),
    nonEmpty(message)
);

export const usernameSchema = () => pipe(
    string(),
    nonEmpty('Имя пользователя обязательно'),
    minLength(3, 'Имя пользователя должно быть длиннее 3 символов'),
    maxLength(32, 'Имя пользователя должно быть короче 32 символов')
);

export const emailSchema = () => pipe(
    string(),
    email('Электронная почта не соответствует маске')
);

export const passwordSchema = () => pipe(
    string(),
    minLength(8, 'Пароль должен быть длиннее 8 символов'),
    regex(/[a-z]/, 'Пароль должен содержать хотя бы один символ в нижнем регистре'),
    regex(/[A-Z]/, 'Пароль должен содержать хотя бы один символ в верхнем регистре'),
    regex(/[0-9]/, 'Пароль должен содержать хотя бы один символ цифры'),
    regex(/[^a-zA-Z0-9]/, 'Пароль должен содержать хотя бы один спецсимвол')
);

/**
 * Схема повтора пароля. Принимает геттер актуального пароля, чтобы кросс-валидация
 * не была завязана на конкретный store.
 * @param {() => string} getPassword
 */
export const passwordRepeatSchema = (getPassword) => pipe(
    string(),
    check((repeat) => repeat === getPassword(), 'Пароли должны совпадать')
);

export const inviteCodeSchema = () => pipeAsync(
    string(),
    minLength(8, 'Код приглашения должен состоять из 8 символов'),
    checkAsync((code) => voucherService.isInviteCodeValid(code), 'Неверный код приглашения')
);
// Регулярное выражение для проверки хоста/домена (например, mc.server.net)
const HOST_REGEX = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}$/;

export const hostSchema = (message) => pipe(
    string(),
    trim(),
    union([
      pipe(string(), ip()),
      pipe(string(), regex(HOST_REGEX))
    ], message)
);
