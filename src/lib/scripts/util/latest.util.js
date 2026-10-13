/**
 * Защита от устаревших результатов асинхронных операций: из нескольких начатых
 * актуальна только последняя.
 *
 * @example
 * const isLatest = latest.next();
 * const data = await fetchSomething();
 * if (!isLatest()) return; // пока ждали, началась другая операция
 */
export function createLatest() {
  let current = 0;
  return {
    /** Начать операцию; возвращает проверку «она всё ещё последняя». */
    next() {
      const version = ++current;
      return () => version === current;
    },
    /** Сделать устаревшими все начатые операции (выход, сброс). */
    invalidate() {
      current++;
    }
  };
}
