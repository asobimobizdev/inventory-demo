import { repository } from "./index";

const initialState = {
  transfers: [],
};

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    ["transfers"](state, transfers) {
      state.transfers = transfers;
    },
    ["addTransfer"](state, transaction) {
      state.transfers = [transaction, ...state.transfers];
    },
  },
  actions: {
    async getTransfers(context) {
      const transfers = await repository.getPastAsobiCoinTransfers();
      transfers.reverse();
      console.log(transfers);
      context.commit("transfers", transfers);
    },
  },
  getters: {
  },
};
