<template>
  <el-container class="host">
    <el-header>
      <el-menu
        :router="true"
        :default-active="activeLink"
        class="el-menu-demo"
        mode="horizontal">
        <el-menu-item index="/">
          <router-link :to="{ name: 'home' }" exact>Inventory</router-link>
        </el-menu-item>
        <el-menu-item index="/friends">
          <router-link :to="{ name: 'friends' }" exact>Friends</router-link>
        </el-menu-item>
        <el-menu-item index="/contract">
          <router-link :to="{ name: 'contract' }" exact>Contract</router-link>
        </el-menu-item>
      </el-menu>
    </el-header>

    <router-view  class="content" />

  </el-container>
</template>

<script>
// import AppNav from "./AppNav.vue";

export default {
  // components: { AppNav }
  created() {},
  data() {
    return {};
  },
  computed: {
    activeLink() {
      return this.$route.path;
    },
  },
};
</script>


<style lang="stylus">
html, body
  height 100%

html
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;

*, *:before, *:after
  box-sizing: border-box;
  margin: 0;

.host
  width 100vw
  height calc(100vh - 0px)
  overflow hidden

</style>

