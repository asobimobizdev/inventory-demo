export default {
  namespaced: true,
  state: {
    trades: [],
    selectedTradeID: null,
  },
  mutations: {
    ["addTrade"](state, { id, otherUserID }) {
      state.trades.push({
        id,
        otherUserID,
        myGoods: [],
        otherGoods: [],
      });
    },
    ["addGoodToMyOffer"](state, { tradeID, good }) {
      const trade = state.trades.find(trade => trade.id == tradeID);
      trade.myGoods.push(good);
    },
  },
  actions: {

  },
};
