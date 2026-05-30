import {sequence} from "$lib/scripts/util/utils.js";

const seq = sequence();
export default {
  LEVEL: {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error'
  },
  create: (message, level) => {
    return {id: seq.increment(), message, level};
  }
}