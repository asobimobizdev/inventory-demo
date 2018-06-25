import { dapp } from "@/lib/dapp";

export default {
  async fetch({ store, params }) {
    try {
      await dapp.asyncInitialize();
    } catch(e) {
      console.error("Network issue", e);
      return;
    }
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
      console.error("Could not access contracts", e);
    }
    store.commit("dapp/initialized", true);
  },
};
