export const LEVEL = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
};

export const LEVEL_WEIGHTS = {
  [LEVEL.INFO]: 1,
  [LEVEL.WARNING]: 2,
  [LEVEL.ERROR]: 3
};
let nextNoticeId = 0;

/** Уведомление {id, message, level}; id уникален в пределах страницы (ключ для {#each}). */
export const createNotice = (message, level) => ({id: nextNoticeId++, message, level});

/** Самый серьёзный уровень среди уведомлений; null — если их нет. */
export const maxLevel = (items) => {
  if (!items.length) return null;
  return items.reduce((maxLvl, notice) => {
    return (LEVEL_WEIGHTS[notice.level] || 0) > (LEVEL_WEIGHTS[maxLvl] || 0)
      ? notice.level
      : maxLvl;
  }, LEVEL.INFO);
};
