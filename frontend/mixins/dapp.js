import { dapp } from "@/lib/dapp";

export default {
  fetch({ store }){
    if(store.state.dappInit) return;
    dapp.initialize(()=>{
      store.commit("dapp/initialized", true );
    });
  }
};
