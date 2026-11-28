import {api} from "#api/client.js";

export const notificationsApi = {
  async getPublicVapidKey(){
    return (await api.ensureOk(await api.get('/notifications/key'))).text();
  },

  async subscribe(subscription){
      const body = JSON.stringify(subscription);
      return await api.put('/notifications/subscriptions', {body})
  },

  async unsubscribe(deviceId){
    await api.ensureOk(await api.delete(`/notifications/subscriptions/${deviceId}`));
  },

  async broadcast(notification){
    const body = JSON.stringify(notification);
    const res = await api.post('/notifications/broadcast', {body});
    console.log(res.ok);
  }
}