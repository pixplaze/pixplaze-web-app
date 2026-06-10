import {sequence} from "$lib/scripts/util/utils.js";

class NoticeService {
  constructor() {
    this.idGenerator = sequence();
  }
  create(message, level) {
    return {id: this.idGenerator.increment(), message, level}
  }
}

export const noticeService = new NoticeService();