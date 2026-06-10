import {api} from "$lib/scripts/api/api.config.js";

class VoucherService {
  async getInviteCodeMessage(code){
      const message = await api.get(`/vouchers/invite/message/${code}`);
      return message.text();
  }

  async isInviteCodeValid(code) {
    if (code.length < 8) {
      return true;
    }

    try {
      const result = await api.post(`/vouchers/invite/validate/${code}`);
      return await result.json();
    } catch (e) {
      return false;
    }
  }
}

export const voucherService = new VoucherService();