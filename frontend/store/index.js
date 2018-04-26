import Vuex from "vuex";
import { dapp } from "@/lib/dapp";
import uuid from "uuid/v1";

const localStorage = window.localStorage;

let token;

//TMP TEST CODE
let testGoods = Array.from(Array(3)).map((it, i) => {
  return {
    id: uuid(),
    confirmed: true
  };
});

let testFriendGoods = Array.from(Array(2)).map((it, i) => {
  return {
    id: uuid(),
    confirmed: true
  };
});

let testFriends = Array.from(Array(3)).map((it, i) => {
  return {
    id: uuid(),
    name: `Franco ${i}`
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
          "0xa0a6181616e04593d6F00EE6ed43037bB69848A6",
        );
      },
      ["isMintOwner"](state, isMintOwner) {
        state.isMintOwner = isMintOwner;
      },
      ["goods"](state, goods) {
        goods = goods.filter((item) => {
          return !state.friendGoods.find((friendItem) => {
            return item.id == friendItem.id;
          });
        });
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

      addFriend(context, friend) {
        const friends = [...context.state.friends, { ...friend }];
        context.commit("friends", friends);
      },

      deleteFriend(context, friend) {
        const friends = context.state.friends.filter(it => {
          return !(it.id == friend.id);
        })
        context.commit("friends", friends);
      },

      async getGoods(context) {
        let items = await dapp.getTokensForAddress(
          token,
          dapp.defaultAccount,
        );
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
        // const address = context.state.selectedFriend.id;
        // const goods = dapp.getTokensForAddress(token, selectedFriend);
        context.commit("friendGoods", testFriendGoods);
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

      transferGoodToSelectedFriend(context, good) {
        let receiverAddress = context.state.selectedFriend.id;
        let tokenID = good.id;

        const newGoods = context.state.goods.filter(it => {
          return it.id != good.id;
        })
        context.commit("goods", newGoods);
        good.confirmed = false;
        const newFriendGoods = [...context.state.friendGoods, good];
        context.commit("friendGoods", newFriendGoods);

        context.dispatch("transferToken", { receiverAddress, tokenID });
      },

      async transferToken(context, { receiverAddress, tokenID }) {
        await token.methods.approve(receiverAddress, tokenID);
        await token.methods.transferFrom(
          dapp.defaultAccount,
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
