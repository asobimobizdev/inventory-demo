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

// import VueMeteorTracker from 'vue-meteor-tracker'
// Vue.use(VueMeteorTracker)
// Vue.config.meteor.freeze = true

