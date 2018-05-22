import { decorateGoodWithId, repository } from "./index";

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  namespaced: true,
  state: {
    id: null,
    otherUserID: null,
    myGoods: [],
    otherGoods: [],
  },
  mutations: {
    ["setTrade"](state, { id, otherUserID }) {
      state.id = id;
      state.otherUserID = otherUserID;
      state.myGoods = [];
      state.otherGoods = [];
    },
    ["resetTrade"](state) {
      state.id = null;
      state.otherUserID = null;
      state.myGoods = [];
      state.otherGoods = [];
    },
    ["setMyGoods"](state, goods) {
      state.myGoods = goods;
    },
    ["setOtherGoods"](state, goods) {
      state.otherGoods = goods;
    },
  },
  actions: {
    async loadTrade(context) {
      const result = await repository.loadTrade(
        context.rootState.accountAddress,
      );
      console.log("loadTrade", result);
      if (!result) {
        return;
      }
      context.commit("setTrade", result);
    },
    async startTradeWithSelectedUser(context) {
      const otherUserID = context.rootState.selectedFriendId;
      if (!otherUserID) return;

      const trade = await repository.createTrade(
        context.rootState.accountAddress,
        otherUserID,
      );

      await timeout(500);

      context.commit("setTrade", {
        id: Math.ceil(Math.random() * 10000000),
        otherUserID,
      });

    },
    async cancelTrade(context) {
      await repository.cancelTrade();
      context.commit("resetTrade");
    },
    async confirmTrade(context) {
      context.commit("resetTrade");
    },
    transfereGoodToMyOffer(context, good) {
      const transaction = {
        from: context.state.accountAddress,
        to: context.state.id,
        goodID: good.id,
      };

      context.commit("addUnconfirmedTransaction", transaction, { root: true });
      // p2pManager.addUnconfirmedTransaction(context.state.accountAddress, address, goodID);

      // try {
      //   await repository.transferGood(
      //     goodID,
      //     context.state.accountAddress,
      //     address,
      //     repository.c.goodsContract,
      //   );
      // } catch (e) {
      //   transaction.confirmed = false;
      //   context.commit("removeUnconfirmedTransaction", transaction);
      //   p2pManager.removeUnconfirmedTransaction(context.state.accountAddress, address, goodID, false);
      // }

    },
    transfereGoodFromMyOffer(context, good) {
      const transaction = {
        from: context.state.id,
        to: context.state.accountAddress,
        goodID: good.id,
      };

      context.commit("addUnconfirmedTransaction", transaction, { root: true });
      // p2pManager.addUnconfirmedTransaction(context.state.accountAddress, address, goodID);
    },


  },
  getters: {
    otherUser(state, getters, rootState, rootGetters) {
      return rootState.friends.find(user => user.id == state.otherUserID);
    },
    allMyOfferedGoods(state, getters, rootState, rootGetters) {
      let transaction;
      const unconfirmedGoods = [];
      const goodsToRemove = {};

      for (let tID in rootState.unconfirmedTransactions) {
        transaction = rootState.unconfirmedTransactions[tID];
        if (transaction.from == state.id) {
          goodsToRemove[transaction.goodID] = transaction.goodID;
          continue;
        }
        if (transaction.to != state.id) continue;

        unconfirmedGoods.push({
          id: transaction.goodID,
          confirmed: false,
          ...decorateGoodWithId(transaction.goodID),
        });
      }

      const goods = state.myGoods.filter(good => {
        return !goodsToRemove[good.id];
      });

      return [...goods, ...unconfirmedGoods];
    },
  },
};
