import {sequence} from "$lib/scripts/util/utils.js";
import {LEVEL, LEVEL_WEIGHTS} from "$lib/scripts/util/notice.util.js";

class NoticeService {
  constructor() {
    this.idGenerator = sequence();
  }
  create(message, level) {
    return {id: this.idGenerator.increment(), message, level}
  }
}

export const maxLevel = (items) => {
  if (!items.length) return null;
  return items.reduce((maxLvl, notice) => {
    return (LEVEL_WEIGHTS[notice.level] || 0) > (LEVEL_WEIGHTS[maxLvl] || 0)
      ? notice.level
      : maxLvl;
  }, LEVEL.INFO);
};

export const noticeService = new NoticeService();