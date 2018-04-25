<template>
  <form v-on:submit.prevent="createToken()">
    <button>
      Create NFT
    </button>
  </form>
</template>

<script>
import Dapp from "@/lib/dapp";

export default {
  components: {
  },
  mounted() {
    this.dapp = new Dapp();
    this.dapp.initialize(this.ready());
  },
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
