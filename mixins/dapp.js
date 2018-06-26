import { dapp } from "@/lib/dapp";

export default {
  async fetch({ store, params }) {
    try {
      await dapp.asyncInitialize();
      store.commit("accountAddress", dapp.defaultAccount);
    } catch(e) {
      console.error("Network issue", e);
      return;
    }
    try {
      store.dispatch("getGoodsContract");
      store.dispatch("getAsobiCoinContract");
      store.dispatch("getEscrowContract");
      store.dispatch("getShopContract");
      store.dispatch("getTradeRegistryContract");
      store.dispatch("getUserRegistryContract");
    } catch(e) {
      console.error("Address issue", e);
      return;
    }

    try {
      await Promise.all([
        store.dispatch("getBalance"),
        store.dispatch("getFriends"),
        store.dispatch("getRegisterState"),
        store.dispatch("trade/loadTrade"),
      ]);
    } catch(e) {
      console.error("Could not access contracts", e);
      return;
    }
    store.commit("dapp/initialized", true);
  },
};
