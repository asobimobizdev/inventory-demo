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
  mixins: [
    dappMixin,
  ],
  data() {
    return {
    };
  },
  methods: {
    ready() {

    },
    createToken() {
      this.dapp.deployContract(this.dapp.contracts.MintableERC721);
    },
    tokenCreated(contract) {
      alert(`contract created ${contract}`);
    },
  }
};
</script>

<style lang="stylus" scoped>
</style>
