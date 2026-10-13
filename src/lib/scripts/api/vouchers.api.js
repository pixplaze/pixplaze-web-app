import {api} from "$lib/scripts/api/client.js";

/** Коды приглашения. */
export const vouchersApi = {
  async getInviteCodeMessage(code) {
    const message = await api.get(`/vouchers/invite/message/${code}`);
    return message.text();
  },

  async isInviteCodeValid(code) {
    try {
      const result = await api.post(`/vouchers/invite/validate/${code}`);
      return await result.json();
    } catch (e) {
      return false;
    }
  }
};
