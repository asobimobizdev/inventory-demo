import { dapp } from "@/lib/dapp";

export default {
  async fetch({ store }) {
    if (store.state.dappInit) return;
    await dapp._initialize();
    store.commit("dapp/initialized", true);
  }
};
