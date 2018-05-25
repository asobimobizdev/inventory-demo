import Vue from "vue";

import VueRouter from "vue-router";
Vue.use(VueRouter);

import Vuex from "vuex";
Vue.use(Vuex);

import Element from "element-ui";
import locale from "element-ui/lib/locale/lang/en";
import "element-ui/lib/theme-chalk/reset.css";
import "element-ui/lib/theme-chalk/index.css";

Vue.use(Element, { locale });

// import VueAnimateNumber from "vue-animate-number";

if (process.browser) {
  const VueAnimateNumber = require("vue-animate-number");
  Vue.use(VueAnimateNumber);
}

import VueFilterDateFormat from "vue-filter-date-format";
Vue.use(VueFilterDateFormat);
