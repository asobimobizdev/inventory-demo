import Vuex from "vuex";
import { dapp } from "../lib/dapp";
import uuid from "uuid/v1";
import { p2pManager } from "../lib/p2p.js";

const localStorage = window.localStorage;

function isEqual(a, b) {
  if (a.length != b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (!b[i] || a[i].id != b[i].id) return false;
  }

  return true;
}

const createStore = () => {
  return new Vuex.Store({
    state: {
      dappInit: false,
      isGoodsAdmin: false,
      contract: null,
      accountAddress: null,
      goods: [],
      goodsLoading: false,
      friends: [],
      friendsLoading: false,
      friendGoods: [],
      friendGoodsLoading: false,
      selectedFriendIndex: -1,
      unconfirmedTransactions: {},
    },
    mutations: {
      ["dapp/initialized"](state, isInit) {
        state.dappInit = isInit;
      },
      ["isGoodsAdmin"](state, isGoodsAdmin) {
        state.isGoodsAdmin = isGoodsAdmin;
      },
      ["goods"](state, goods) {
        goods.forEach(good => {
          const from = state.accountAddress;
          const selectedFriend = state.friends[state.selectedFriendIndex];
          if (!selectedFriend) return;
          const to = selectedFriend.id;
          const tID = `${to}-${from}-${good.id}`;
          delete state.unconfirmedTransactions[tID];
        });

        state.goods = goods;
      },
      ["goodsLoading"](state, loading) {
        state.goodsLoading = loading;
      },
      ["friends"](state, friends) {
        state.friends = friends || [];
        state.selectedFriendIndex = state.friends.length > 0 ? 0 : -1;
      },
      ["friendsLoading"](state, loading) {
        state.friendsLoading = loading;
      },
      ["friendGoods"](state, goods) {

        goods.forEach(good => {
          const from = state.accountAddress;
          const to = state.friends[state.selectedFriendIndex].id;
          const tID = `${from}-${to}-${good.id}`;
          delete state.unconfirmedTransactions[tID];
        });

        state.friendGoods = goods;
      },
      ["friendGoodsLoading"](state, loading) {
        state.friendGoodsLoading = loading;
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
          dapp.contracts.Goods,
          address,
        );
        state.accountAddress = state.contract.defaultAccount;
      },

      ["addUnconfirmedTransaction"](state, transaction) {
        const tID = `${transaction.from}-${transaction.to}-${transaction.goodID}`;
        state.unconfirmedTransactions = { [tID]: transaction, ...state.unconfirmedTransactions };
      },

      ["removeUnconfirmedTransaction"](state, transaction) {
        const tID = `${transaction.from}-${transaction.to}-${transaction.goodID}`;
        delete state.unconfirmedTransactions[tID];
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
        let goods = await dapp.getTokensForAddress(
          context.state.contract,
          dapp.defaultAccount,
        );
        goods.sort((a, b) => { return a.id > b.id; });
        if (!isEqual(context.state.goods, goods)) {
          context.commit("goods", goods);
          context.commit("goodsLoading", false);
        }
      },

      async getSelectedFriendGoods(context) {
        // context.commit("friendGoodsLoading", true);
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

        goods.sort((a, b) => { return a.id > b.id; });
        if (!isEqual(context.state.friendGoods, goods)) {
          context.commit("friendGoods", goods);
          context.commit("friendGoodsLoading", false);
        }
      },

      async createGoodsContract(context) {
        const contract = await dapp.deployContract(
          dapp.contracts.Goods, []
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
          context.dispatch("getSelectedFriendGoods");
          if (this.getOwnGoodsTimer) {
            window.clearTimeout(this.getOwnGoodsTimer);
          }
          this.getOwnGoodsTimer = window.setTimeout(a, 1000);
        };
        a();

        p2pManager.subscribe(context.state.accountAddress, context);
      },

      transferGoodToSelectedFriend(context, good) {
        let address = context.state.friends[
          context.state.selectedFriendIndex
        ].id;

        const tokenID = good.id;

        p2pManager.dispatchTransaction(context.state.accountAddress, address, good.id);

        context.commit("addUnconfirmedTransaction", { from: context.state.accountAddress, to: address, goodID: good.id });
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
    getters: {
      selectFriend: state => {
        const index = state.selectedFriendIndex;
        const friend = state.friends[index];
        return friend;
      },
      allGoods: state => {
        let transaction;
        const unconfirmedGoods = [];
        const goodsToRemove = {};

        // state.unconfirmedTransactions.forEach(transaction => {
        for (let tID in state.unconfirmedTransactions) {
          transaction = state.unconfirmedTransactions[tID];

          if (transaction.from == state.accountAddress) {
            goodsToRemove[transaction.goodID] = transaction.goodID;
            continue;
          }

          unconfirmedGoods.push({
            id: transaction.goodID,
            confirmed: false,
          });
        }

        const goods = state.goods.filter(good => {
          return !goodsToRemove[good.id];
        });

        return [...goods, ...unconfirmedGoods];
      },
      allFriendGoods: state => {

        let transaction;
        const unconfirmedGoods = [];
        const goodsToRemove = {};

        const friend = state.friends[state.selectedFriendIndex];
        if (!friend) return;

        // state.unconfirmedTransactions.forEach(transaction => {
        for (let tID in state.unconfirmedTransactions) {
          transaction = state.unconfirmedTransactions[tID];
          if (transaction.from == friend.id) {
            goodsToRemove[transaction.goodID] = transaction.goodID;
            continue;
          }
          if (transaction.to != friend.id) continue;

          unconfirmedGoods.push({
            id: transaction.goodID,
            confirmed: false,
          });
        }

        const goods = state.friendGoods.filter(good => {
          return !goodsToRemove[good.id];
        });

        return [...goods, ...unconfirmedGoods];
      },
    },
  });
};
export default createStore;
