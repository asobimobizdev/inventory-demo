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
    ["startTrade"](state, { id, otherUserID }) {
      state.id = id;
      state.otherUserID = otherUserID;
      state.myGoods = [];
      state.otherGoods = [];
    },
    ["endTrade"](state) {
      state.id = null;
      state.otherUserID = null;
      state.myGoods = [];
      state.otherGoods = [];
    },
    ["addGoodToMyOffer"](state, { good }) {
      state.myGoods.push(good);
    },
  },
  actions: {
    async startTradeWithSelectedUser(context) {
      const otherUserID = context.rootState.selectedFriendId;
      if (!otherUserID) return;

      await timeout(500);

      context.commit("startTrade", {
        id: Math.ceil(Math.random() * 10000000),
        otherUserID,
      });

    },
    async cancelTrade(context) {
      context.commit("endTrade");
    },
    async confirmTrade(context) {
      context.commit("endTrade");
    },
  },
  getters: {
    otherUser(state, getters, rootState, rootGetters) {
      return rootState.friends.find(user => user.id == state.otherUserID);
    },
  },
};
