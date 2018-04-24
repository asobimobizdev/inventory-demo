import Vue from "vue";
// import Element from 'element-ui'
// import locale from 'element-ui/lib/locale/lang/en'
import VueLocalStorage from "vue-localstorage";

export default () => {

  Vue.use(VueLocalStorage, {
    name: "asobimo-inventory-demo",
    bind: true
  });
};
