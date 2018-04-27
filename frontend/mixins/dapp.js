import { dapp } from "@/lib/dapp";

export default {
  async fetch({ store }) {
    if (store.state.dappInit) return;
    await dapp.asyncInitialize();
    store.dispatch("getContract");
    console.log(store.state.contract);
    console.log("Fetch");
    store.commit("dapp/initialized", true);
  },
};
