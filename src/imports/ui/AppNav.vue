<template>
<nav>  
  <router-link class="logo" :to="{ name: 'home' }" exact></router-link>
  <div class="spring"></div>
  
  <div class="group collapsible">
    
    <router-link class="button" :to="{ name: 'dashboard' }" exact>Dashboard</router-link>
    <router-link class="button" :to="{ name: 'explore' }" exact>Explore</router-link>
    <router-link class="button" :to="{ name: 'help' }" exact>Help</router-link>
    
  </div>
  
  <div class="spring"></div>

  <div class="group end collapsible">
    <template v-if="user">
      <span>{{username}}</span>
      <button v-on:click="logout()">Logout</button>
    </template>  
    <router-link v-else class="button" :to="{ name: 'login' }" exact>Sign In</router-link>
  </div>

  <button class="menu">-</button>

</nav>  
</template>

<script>
export default {
  computed: {
    user() {
      return this.$store.state.user;
    },
    username() {
      return this.user ? this.user.username : "";
    },
  },
  methods: {
    logout() {
      this.$store.dispatch("logout");
    },
  },
};
</script>

<style lang="stylus" scoped>
.logo
  text-decoration none
  padding 0 10px
  font-weight bold
  color #000
</style>
