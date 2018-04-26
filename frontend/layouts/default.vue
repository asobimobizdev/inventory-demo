<template>
  <el-container>
    <el-header>
      <el-menu
        :router="true"
        :default-active="activeLink"
        class="el-menu-demo"
        mode="horizontal">
        <el-menu-item index="/">
          <nuxt-link to="/">
            Inventory
          </nuxt-link>
        </el-menu-item>
        <el-menu-item index="/friends">
          <nuxt-link to="/friends">
            Friends
          </nuxt-link>
        </el-menu-item>
        <el-menu-item index="/deploy-contract">
          <nuxt-link to="/deploy-contract">
            Deploy Contract
          </nuxt-link>
        </el-menu-item>
        <el-menu-item index="/mint-token">
          <nuxt-link to="/mint-token">
            Mint Token
          </nuxt-link>
        </el-menu-item>
      </el-menu>
    </el-header>

    <el-main>
      <nuxt class="content"/>
    </el-main>

  </el-container>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    activeLink() {
      return this.$nuxt.$route.path;
    }
  }
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

main
  width 100vw
  min-height 100vh

  >.content
    min-height 100vh
</style>
