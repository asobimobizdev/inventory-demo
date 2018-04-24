<template>

<el-container>

  <el-header>   
    <el-menu :router="true" :default-active="activeLink" class="el-menu-demo" mode="horizontal">
      <el-menu-item index="/"><nuxt-link to="/">Cover</nuxt-link></el-menu-item>
      <el-menu-item index="/admin-goods"><nuxt-link to="/admin-goods">Goods Admin</nuxt-link></el-menu-item>
      <el-menu-item index="/inventory"><nuxt-link to="/inventory">inventory</nuxt-link></el-menu-item>
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
  // font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
