<template>
  <form v-on:submit.prevent="createToken()">
    <button>
      Create NFT
    </button>
  </form>
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
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
