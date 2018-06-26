import { decorateGoodWithId, repository } from "./index";

const initialState = {
  id: null,
  otherUserID: null,
  myGoods: [],
  otherGoods: [],
  accepted: false,
  otherAccepted: false,
  pulled: false,
};

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    ["setTrade"](state, { id, otherUserID, accepted, otherAccepted, pulled }) {
      state.id = id;
      state.otherUserID = otherUserID;
      state.myGoods = [];
      state.otherGoods = [];
      state.accepted = accepted;
      state.otherAccepted = otherAccepted;
      state.pulled = pulled;
    },
    ["resetTrade"](state) {
      state = { ...state, ...initialState };
    },
    ["setMyGoods"](state, goods) {
      state.myGoods = goods.map((good) => decorateGoodWithId(good));
    },
    ["setOtherGoods"](state, goods) {
      state.otherGoods = goods.map((good) => decorateGoodWithId(good));
    },
  },
  actions: {
    async loadTrade(context) {
      const result = await repository.loadTrade(
        context.rootState.accountAddress,
      );
      console.log("loadTrade", result);
      if (!result) {
        context.commit("resetTrade", result);
        return;
      }
      context.commit("setTrade", result);
      const tradeGoods = await repository.getTradeGoods();
      const filter = (good) => good.trader == context.rootState.accountAddress;

      context.commit(
        "setMyGoods", tradeGoods.filter(filter),
      );
      context.commit(
        "setOtherGoods",
        tradeGoods.filter((good) => !filter(good)),
      );

      repository.tradeEvents()
        .on("data", (event) => {
          console.log("Trade event", event);
          context.dispatch("loadTrade");
        })
        .on("error", console.log);
    },
    async startTradeWithSelectedUser(context) {
      const otherUserID = context.rootState.selectedFriendId;
      if (!otherUserID) return;

      await repository.createTrade(
        context.rootState.accountAddress,
        otherUserID,
      );

      context.commit("setTrade", {
        id: Math.ceil(Math.random() * 10000000),
        otherUserID,
      });

    },
    async cancelTrade(context) {
      await repository.cancelTrade();
      await context.dispatch("closeTrade");
      context.commit("resetTrade");
    },
    async closeTrade(context) {
      await repository.closeTrade();
      context.commit("resetTrade");
    },
    async confirmTrade(context) {
      await repository.confirmTrade();
      context.commit("resetTrade");
    },
    async withdrawTrade(context) {
      await repository.withdrawTrade();
    },
    async pullGoods(context) {
      await repository.pullGoods();
      // ??
    },
    async transfereGoodToMyOffer(context, good) {
      const goodID = good.id;

      console.log("transfereGoodToMyOffer", goodID);

      context.commit("addUnconfirmedTransaction", goodID, { root: true });
      try {
        await repository.transferToTrade(
          context.rootState.accountAddress,
          goodID,
        );
      } catch (e) {
        context.commit("removeUnconfirmedTransaction", goodID, { root: true });
        console.error("transfereGoodToMyOffer", e);
      }
    },
    async transfereGoodFromMyOffer(context, good) {
      const goodID = good.id;

      console.log("transfereGoodFromMyOffer", goodID);

      context.commit("addUnconfirmedTransaction", goodID, { root: true });

      try {
        await repository.removeGoodFromTrade(goodID);
      } catch (e) {
        context.commit("removeUnconfirmedTransaction", goodID, { root: true });
        console.error("transfereGoodFromMyOffer", e);
      }
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

      for (let goodID in rootState.unconfirmedTransactions) {
        transaction = rootState.unconfirmedTransactions[goodID];
        unconfirmedGoods.push(decorateGoodWithId(transaction));
      }

      const goods = state.myGoods.filter(good => {
        return !goodsToRemove[good.id];
      });

      return [...goods, ...unconfirmedGoods];
    },
  },
};
