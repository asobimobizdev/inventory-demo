import Vue from "vue";
import { Meteor } from "meteor/meteor";
import NotFound from "./pages/not-found.vue";

import { dapp } from "./lib/dapp";

import { store } from "./app";
import index from "./pages/index.vue";
import friends from "./pages/friends.vue";
import contract from "./pages/contract.vue";

export default [
  { path: "/", name: "home", component: index, meta: { requiresWeb3: true } },
  { path: "/friends", name: "friends", component: friends, meta: { requiresWeb3: true } },
  { path: "/contract", name: "contract", component: contract, meta: { requiresWeb3: true } },
  { path: "*", name: "not-found", component: NotFound },
];

export const beforeEach = async function (to, from, next) {
  if (to.matched.some(record => record.meta.requiresWeb3) && !store.state.dappInit) {
    await dapp.asyncInitialize();
    store.commit("accountAddress", dapp.defaultAccount);
    store.dispatch("getGoodsContract");
    store.dispatch("getAsobiCoinContract");
    store.dispatch("getEscrowContract");
    store.dispatch("getBalance");
    store.dispatch("subscribeToFriends");
    store.commit("dapp/initialized", true);
  }

  next();
};
