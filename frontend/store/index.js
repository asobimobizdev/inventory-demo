import Vuex from "vuex";
import { dapp } from "@/lib/dapp";

const createStore = () => {
  return new Vuex.Store({
    state: {
      dappInit: false
    },
    mutations: {
      ["dapp/initialized"](state, isInit) {
        state.dappInit = isInit;
      }
    },
    actions: {
      createToken() {
        dapp.deployContract(dapp.contracts.MintableERC721);
      },
      tokenCreated(contex, contract) {
        alert(`contract created ${contract}`);

        //commit something to the store  
        contex.commit("");
      },
      async transferToken(contex) {
        const receiverAddress = "0x0";
        const tokenID = "0";
        await this.token.methods.approve(receiverAddress, tokenID);
        await this.token.methods.transferFrom(
          this.dapp.defaultAccount,
          receiverAddress,
          tokenID,
        );

        //commit something to the store
        contex.commit("");
      }
    }
  });
};
export default createStore;