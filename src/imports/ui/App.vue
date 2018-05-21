<template>
  <el-container class="host">
    <el-header class="main-header">
      <router-link :to="{ name: 'home' }" exact>
        <div class="logo"></div>
      </router-link>
      <el-menu
        :router="true"
        :default-active="activeLink"
        class="main-menu"
        mode="horizontal">
        <el-menu-item index="/">
          <router-link :to="{ name: 'home' }" exact>Inventory</router-link>
        </el-menu-item>
        <el-menu-item index="/trading">
          <router-link :to="{ name: 'trading' }" exact>Trading</router-link>
        </el-menu-item>
        <el-menu-item index="/friends">
          <router-link :to="{ name: 'friends' }" exact>Friends</router-link>
        </el-menu-item>
      </el-menu>
      <div class="balance"><span class="label">Balance:</span> <span class="value">{{balance}}₳</span></div>
    </el-header>

    <router-view  class="content" />

  </el-container>
</template>

<script>
export default {
  created() {},
  data() {
    return {};
  },
  computed: {
    activeLink() {
      return this.$route.path;
    },
    balance() {
      return this.$store.state.balance;
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
  overflow auto

.main-header
  .logo
    float left
    background url("AsobiCoin.svg")
    background-repeat no-repeat
    background-position center center
    width 60px
    height 60px
    margin-right 8px

  .main-menu
    // background alpha(#f00,0.3)
    float left

  .balance
    font-size 18px
    float right
    line-height 60px
    .label
      color #aaa
    .value
      font-weight bold
      color darken(#409EFF, 10%)

</style>

