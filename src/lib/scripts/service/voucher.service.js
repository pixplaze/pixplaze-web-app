import {api} from "$lib/scripts/api/api.config.js";

class VoucherService {
  async isInviteCodeValid(voucher) {
    if (voucher.length < 8) {
      return true;
    }

    try {
      const result = await api.post(`/vouchers/invite/validate/${voucher}`);
      return await result.json();
    } catch (e) {
      return false;
    }
  }
}

export const voucherService = new VoucherService();