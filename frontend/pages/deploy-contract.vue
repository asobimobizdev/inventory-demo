<template>
  <el-main class="full-centered-content">
    <el-button @click="createContract()" type="primary" round >Create NFT</el-button>
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
    createContract() {
      this.$store.dispatch("createContract");
    },
  }
};
</script>

<style lang="stylus" scoped>
</style>
