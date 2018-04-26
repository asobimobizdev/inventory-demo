import Vuex from "vuex";
import { dapp } from "@/lib/dapp";
import uuid from "uuid/v1";

const localStorage = window.localStorage;

let token;

//-------------

const createStore = () => {
  return new Vuex.Store({
    state: {
      dappInit: false,
      isMintOwner: false,

      goods: [],
      friends: [],
      friendGoods: [],

      selectedFriendIndex: -1,
    },
    mutations: {
      ["dapp/initialized"](state, isInit) {
        state.dappInit = isInit;

        token = dapp.getContractAt(
          dapp.contracts.MintableERC721,
          "0x552e696a149d7Fe643Dd63236e5842eb93407648",
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
        state.friends = friends || [];
        state.selectedFriendIndex = state.friends.length > 0 ? 0 : -1;
      },
      ["friendGoods"](state, goods) {
        state.friendGoods = goods;
      },
      ["markConfirmed"](state, goodId) {
        const index = state.goods.find((good) => { return good.id === goodId });
        state.goods[index].confirmed = true;
      },
      ["setSelectedFriendIndex"](state, index) {
        state.selectedFriendIndex = index;
      },
    },
    actions: {
      getFriends(context) {
        const friends = JSON.parse(localStorage.getItem("friends"));
        context.commit("friends", friends);
      },
      saveFriends(context) {
        localStorage.setItem("friends", JSON.stringify(context.state.friends));
      },

      addFriend(context, friend) {
        const friends = [...context.state.friends, { ...friend }];
        context.commit("friends", friends);
        context.dispatch("saveFriends");
      },

      deleteFriend(context, friend) {
        const friends = context.state.friends.filter(it => {
          return !(it.id == friend.id);
        })
        context.commit("friends", friends);
      },

      async getOwnGoods(context) {
        let items = await dapp.getTokensForAddress(
          token,
          dapp.defaultAccount,
        );
        context.commit("goods", items);
      },

      async getSelectedFriendGoods(context) {
        if (context.state.selectedFriendIndex == -1) {
          return;
        }
        let address = context.state.friends[
          context.state.selectedFriendIndex
        ].id;
        const goods = await dapp.getTokensForAddress(token, address);
        context.commit("friendGoods", goods);
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
        let address = context.state.friends[
          context.state.selectedFriendIndex
        ].id;
        let tokenID = good.id;

        const newGoods = context.state.goods.filter(it => {
          return it.id != good.id;
        })
        context.commit("goods", newGoods);
        good.confirmed = false;
        const newFriendGoods = [...context.state.friendGoods, good];
        context.commit("friendGoods", newFriendGoods);

        context.dispatch("transferToken", { address, tokenID });
      },

      async transferToken(context, { address, tokenID }) {
        await token.methods.approve(address, tokenID).send();
        await token.methods.transferFrom(
          dapp.defaultAccount,
          address,
          tokenID,
        ).send();
        // mark token as confirmed!
        context.dispatch("getOwnGoods");
      },

      async checkMintOwner(context) {
        const ownerAddress = await token.methods.owner().call();
        const isOwner = ownerAddress == dapp.defaultAccount;
        context.commit("isMintOwner", isOwner);
      },

      async mintToken(context, { address, tokenID }) {
        await token.methods.mint(address, tokenID).send();

        // TODO :: commit something to the store
        // context.commit("");
      },

    },
  });
};
export default createStore;
