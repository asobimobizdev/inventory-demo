import Vuex from "vuex";
import { dapp } from "@/lib/dapp";

const localStorage = window.localStorage;

// const testGoods = Array(200).fill({}).map((it, i) => {
//   return {
//     id: uuid()
//   }
// })

const createStore = () => {
  return new Vuex.Store({
    state: {
      dappInit: false,
      isGoodsAdmin: false,
      contract: null,

      // goods: testGoods,
      goods: [],
      friends: [],
      friendGoods: [],

      selectedFriendIndex: -1,
    },
    mutations: {
      ["dapp/initialized"](state, isInit) {
        state.dappInit = isInit;
      },
      ["isGoodsAdmin"](state, isGoodsAdmin) {
        state.isGoodsAdmin = isGoodsAdmin;
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
        const index = state.goods.find(
          (good) => { return good.id === goodId; },
        );
        state.goods[index].confirmed = true;
      },
      ["setSelectedFriendIndex"](state, index) {
        state.selectedFriendIndex = index;
      },
      ["contract"](state, address) {
        state.contract = dapp.getContractAt(
          dapp.contracts.MintableERC721,
          address,
        );
      },
    },
    actions: {
      selectFriend(context, friendIndex) {
        context.commit("setSelectedFriendIndex", friendIndex);
        context.dispatch("getSelectedFriendGoods");
      },

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
        });
        context.commit("friends", friends);
        context.dispatch("saveFriends");
      },

      async getOwnGoods(context) {
        let items = await dapp.getTokensForAddress(
          context.state.contract,
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
        const goods = await dapp.getTokensForAddress(
          context.state.contract,
          address,
        );
        context.commit("friendGoods", goods);
      },

      async createContract(context) {
        const contract = await dapp.deployContract(
          dapp.contracts.MintableERC721,
          ["Non-Fungible Token", "NFT"],
        );
        const address = contract.options.address;
        context.dispatch("setContract", address);
      },

      getContract(context) {
        const address = localStorage.getItem("contractAddress");
        if (!address) {
          return;
        }
        context.dispatch("registerContract", address);
      },

      setContract(context, address) {
        context.dispatch("registerContract", address);
        localStorage.setItem("contractAddress", address);
      },

      registerContract(context, address) {
        context.commit("contract", address);

        // XXX hack Justus 2018-04-2"7",
        const a = () => {
          context.dispatch("getOwnGoods");
          window.setTimeout(a, 1000);
        };
        window.setTimeout(a, 1000);
      },

      transferGoodToSelectedFriend(context, good) {
        let address = context.state.friends[
          context.state.selectedFriendIndex
        ].id;
        let tokenID = good.id;

        const newGoods = context.state.goods.filter(it => {
          return it.id != good.id;
        });
        context.commit("goods", newGoods);
        good.confirmed = false;
        const newFriendGoods = [...context.state.friendGoods, good];
        context.commit("friendGoods", newFriendGoods);

        context.dispatch("transferToken", { address, tokenID });
      },

      async transferToken(context, { address, tokenID }) {
        await context.state.contract.methods.approve(address, tokenID).send();
        await context.state.contract.methods.transferFrom(
          dapp.defaultAccount,
          address,
          tokenID,
        ).send();
        // mark token as confirmed!
        context.dispatch("getOwnGoods");
        context.dispatch("getSelectedFriendGoods");
      },

      async checkGoodsAdmin(context) {
        const ownerAddress = await context.state.contract.methods.owner(
        ).call();
        const isOwner = ownerAddress == dapp.defaultAccount;
        context.commit("isGoodsAdmin", isOwner);
      },

      async createGoodFor(context, address) {
        const tokenID = dapp.generateTokenID();
        await context.state.contract.methods.mint(address, tokenID).send();
      },

    },
  });
};
export default createStore;
