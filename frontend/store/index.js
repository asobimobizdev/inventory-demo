import Vuex from "vuex";
import { dapp } from "@/lib/dapp";

let token;

const createStore = () => {
  return new Vuex.Store({
    state: {
      dappInit: false,
      isMintOwner: false,
      items: [],
    },
    mutations: {
      ["dapp/initialized"](state, isInit) {
        state.dappInit = isInit;
      },
      ["isMintOwner"](state, isMintOwner) {
        state.isMintOwner = isMintOwner;
      },
      ["items"](state, items) {
        state.items = items;
      },
    },
    actions: {
      async getItems(context) {
        const items = [
          1, 2, 3,
        ];
        context.commit("items", items);
      },
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
        await token.methods.approve(receiverAddress, tokenID);
        await token.methods.transferFrom(
          this.dapp.defaultAccount,
          receiverAddress,
          tokenID,
        );

        //TODO :: commit something to the store
        contex.commit("");
      },

      async checkMintOwner(contex) {
        token = dapp.getContractAt(
          dapp.contracts.MintableERC721,
          "0xDB2E91f83cA869421d22E795a86b623a24c03edB"
        );
        const ownerAddress = await token.methods.owner().call();
        const isOwner = ownerAddress == dapp.defaultAccount;
        contex.commit("isMintOwner", isOwner);
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
