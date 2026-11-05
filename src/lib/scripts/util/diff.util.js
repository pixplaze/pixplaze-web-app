/**
 * Создает функцию контроля изменений (шлюз) на основе строкового слепка.
 * @param {function(...args): string} createSnapshotFunction - Функция, которая генерирует уникальную строку из аргументов.
 * @returns {function(...args): boolean} - Возвращает true, если данные ИЗМЕНИЛИСЬ, и false, если остались прежними.
 */
export function createDiffChecker(createSnapshotFunction) {
  let lastSnapshot = '';

  return (...args) => {
    const currentSnapshot = createSnapshotFunction(...args);

    if (currentSnapshot === lastSnapshot) {
      return false; // Данные НЕ изменились
    }

    lastSnapshot = currentSnapshot;
    return true; // Данные изменились!
  };
}
