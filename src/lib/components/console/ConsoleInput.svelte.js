import {createPrompt} from '$components/console/prompt.js';

/** «/команда аргументы» → `{name, args}` (команда без «/»); строка без «/» — null. */
export function parseCommand(raw) {
  if (!raw.startsWith('/')) return null;
  const name = raw.slice(1).split(/\s/, 1)[0];
  return {name, args: raw.slice(1 + name.length).trim()};
}

/**
 * Строка ввода с предикатом — командой, которая подставляется перед вводом (`/say` + «привет»).
 * Пробел после «/команда» переключает предикат, Backspace в пустом поле возвращает предикат
 * по умолчанию. Без предиката строка уходит как есть (сообщение чата).
 *
 * `predicates` ограничивает команды, на которые можно переключиться (чат: только команды
 * игрока); `null` — любые (консоль).
 */
export class ConsoleInput {
  predicate = $state(null);
  input = $state('');
  #defaultPredicate;
  #allowed;
  #history = createPrompt([], {historyCapacity: 20});

  constructor({defaultPredicate = null, predicates = null} = {}) {
    this.#defaultPredicate = defaultPredicate;
    this.predicate = defaultPredicate;
    this.#allowed = predicates ? new Set(predicates) : null;
  }

  /** Пробел после «/команда»: команда становится предикатом, в поле остаются аргументы. */
  switchPredicate() {
    const command = parseCommand(this.input);
    if (command && this.#isAllowed(command.name)) {
      this.predicate = command.name;
      this.input = command.args;
    }
  }

  /** Backspace в пустом поле: вернуть предикат по умолчанию. */
  resetPredicate() {
    this.predicate = this.#defaultPredicate;
  }

  /**
   * Строка для отправки; поле очищается, строка попадает в историю. Пустое поле — null.
   * Набранная целиком команда («/list», «/msg Steve hi») уходит как есть и предикат не меняет —
   * в том числе одиночная, без аргументов.
   */
  submit() {
    const raw = this.input.trim();
    if (!raw) return null;

    const command = parseCommand(raw);
    const line = command?.name || !this.predicate ? raw : `/${this.predicate} ${raw}`;
    this.#history.enter(line);
    this.input = '';
    return line;
  }

  /** Предыдущая строка из истории (стрелка вверх). */
  previous() {
    this.#recall(this.#history.history().decrement());
  }

  /** Следующая строка из истории (стрелка вниз). */
  next() {
    this.#recall(this.#history.history().increment());
  }

  /** Строка из истории в поле: команда — в предикат и аргументы, если на неё можно переключиться. */
  #recall(line) {
    const command = line ? parseCommand(line) : null;
    if (command && this.#isAllowed(command.name)) {
      this.predicate = command.name;
      this.input = command.args;
    } else {
      this.input = line ?? '';
    }
  }

  #isAllowed(name) {
    return Boolean(name) && (this.#allowed === null || this.#allowed.has(name.toLowerCase()));
  }
}
