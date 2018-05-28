import { dapp } from "@/lib/dapp";

export default {
  async fetch({ store, params }) {
    await dapp.asyncInitialize();
    store.commit("accountAddress", dapp.defaultAccount);
    store.dispatch("getGoodsContract");
    store.dispatch("getAsobiCoinContract");
    store.dispatch("getEscrowContract");
    store.dispatch("getTradeRegistryContract");
    store.dispatch("getUserRegistryContract");
    try {
      await Promise.all([
        store.dispatch("getBalance"),
        store.dispatch("getFriends"),
        store.dispatch("getRegisterState"),
        store.dispatch("trade/loadTrade"),
      ]);
    } catch(e) {
      console.log(e);
      window.alert("Contracts not deployed");
    }
    store.commit("dapp/initialized", true);
  },
};
