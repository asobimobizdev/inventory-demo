<template>
  <el-main class="full-centered-content">
    <el-button @click="createToken()" type="primary" round >Create NFT</el-button>
  </el-main>
</template>

<script>
import dappMixin from "@/mixins/dapp";

export default {
  mixins: [dappMixin],
  data() {
    return {};
  },
  methods: {
    createToken() {
      this.$store.dispatch("createToken");
    },
    tokenCreated(contract) {
      this.$store.dispatch("tokenCreated", contract);
    }
  }
};
</script>

<style lang="stylus" scoped>
</style>
