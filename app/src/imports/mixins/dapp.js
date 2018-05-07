import { dapp } from "../lib/dapp";

export default {
  async fetch({ store }) {
    if (store.state.dappInit) return;
    await dapp.asyncInitialize();
    store.dispatch("getContract");
    store.commit("dapp/initialized", true);
  },
};
