import "./plugins";

import Vue from "vue";
import VueRouter from "vue-router";
import Vuex from "vuex";
import { sync } from "vuex-router-sync";
import App from "./ui/App.vue";
import routes from "./routes";
import { beforeEach } from "./routes";
import createStore from "./store";

export const store = createStore();

import * as filters from "./filters";

export const router = new VueRouter({
  mode: "history",
  routes,
});

sync(store, router);

for (const key in filters) {
  Vue.filter(key, filters[key]);
}

function createApp(context) {
  new Vue({
    ...App,
    el: "app",
    router,
    store,
  });
}
router.beforeEach(beforeEach);

export default createApp;

