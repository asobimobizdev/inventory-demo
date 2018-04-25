import Vuex from "vuex";
import { dapp } from "@/lib/dapp";
let token;

const createStore = () => {
  return new Vuex.Store({
    state: {
      dappInit: false,
      isOwner: false
    },
    mutations: {
      ["dapp/initialized"](state, isInit) {
        state.dappInit = isInit;
      },
      ["test"](state, payload) {
        state.test = payload;
      },
      ["isOwner"](state, isOwner) {
        state.isOwner = isOwner;
      }
    },
    actions: {
      createToken() {
        dapp.deployContract(dapp.contracts.MintableERC721);
      },
      tokenCreated(contex, contract) {
        alert(`contract created ${contract}`);

        //TODO :: commit something to the store    
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

        //TODO :: commit something to the store  
        contex.commit("");
      },

      checkOwner(contex) {

        token = dapp.getContractAt(
          dapp.contracts.MintableERC721,
          "0xDB2E91f83cA869421d22E795a86b623a24c03edB"
        );

        token.methods
          .owner()
          .call()
          .then(ownerAddress => {
            const isOwner = ownerAddress == this.dapp.defaultAccount;
            contex.commit("isOwner", isOwner);
          });

      },

      async mintToken(contex, { receiverAddress, tokenID }) {
        await token.methods.mint(receiverAddress, tokenID).send();

        //TODO :: commit something to the store  
        contex.commit("");
      }

    }
  });
};
export default createStore;