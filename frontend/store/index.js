import Vuex from "vuex";
import { dapp } from "@/lib/dapp";

const localStorage = window.localStorage;

let token;

//TMP TEST CODE
let testGoods = Array.from(Array(3)).map((it, i) => {
  return {
    id: i,
  };
});

let testFriends = Array.from(Array(3)).map((it, i) => {
  return {
    id: i,
  };
});
//-------------

const createStore = () => {
  return new Vuex.Store({
    state: {
      dappInit: false,
      isMintOwner: false,
      goods: [],
      friends: [],
      selectedFriend: null,
      friendGoods: [],
    },
    mutations: {
      ["dapp/initialized"](state, isInit) {
        state.dappInit = isInit;

        token = dapp.getContractAt(
          dapp.contracts.MintableERC721,
          "0x925630803E45475323960540bE0d2e6530e911Aa",
        );
      },
      ["isMintOwner"](state, isMintOwner) {
        state.isMintOwner = isMintOwner;
      },
      ["goods"](state, goods) {
        state.goods = goods;
      },
      ["friends"](state, friends) {
        state.friends = friends;
        state.selectedFriend = friends.length > 0 ? 0 : null;
      },
      ["friendGoods"](state, goods) {
        state.friendGoods = goods;
      },
    },
    actions: {
      getFriendList(context) {
        const friends = JSON.parse(localStorage.getItem("friends"));
        context.commit("friends", friends);
      },
      setFriendList(context) {
        localStorage.setItem("friends", JSON.stringify(context.state.friends));
      },

      async getGoods(context) {

        //TMP TEST CODE
        context.commit("goods", testGoods);
        //

        const items = [
        ];
        console.log("goods", items);
        console.log(token.methods);
        const balance = await token.methods.balanceOf(
          dapp.defaultAccount,
        ).call();
        console.log("balance", balance);
        for (let i = 0; i < balance; i += 1) {
          items.push(
            await token.methods.tokenOfOwnerByIndex(i).call()
          );
        }
        context.commit("goods", items);

      },

      async getFriends(context) {
        //TMP TEST CODE
        context.commit("friends", testFriends);
        return;
        //
      },

      async getSelectedFriendGoods(context) {
        //TMP TEST CODE
        context.commit("friendGoods", testGoods);
        return;
        //
      },

      createToken() {
        dapp.deployContract(
          dapp.contracts.MintableERC721,
          ["Non-Fungible Token", "NFT"],
        );
      },

      tokenCreated(context, contract) {
        alert(`contract created ${contract}`);
      },

      async transferToken(context, { receiverAddress, tokenID }) {

        await token.methods.approve(receiverAddress, tokenID);
        await token.methods.transferFrom(
          this.dapp.defaultAccount,
          receiverAddress,
          tokenID,
        );

        context.dispatch("getGoods");
      },

      async checkMintOwner(context) {
        const ownerAddress = await token.methods.owner().call();
        const isOwner = ownerAddress == dapp.defaultAccount;
        context.commit("isMintOwner", isOwner);
      },

      async mintToken(context, { receiverAddress, tokenID }) {
        await token.methods.mint(receiverAddress, tokenID).send();

        //TODO :: commit something to the store
        context.commit("");
      },

    },
  });
};
export default createStore;
