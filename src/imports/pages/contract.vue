<template>
  <el-main class="full-centered-content">
    <el-card class="create-contract-box full-centered-content">
      <el-button @click="createGoodsContract()" type="primary" round >Create Goods Contract</el-button>
    </el-card>
    <el-card class="create-contract-box full-centered-content">
      <el-button @click="createAsobiCoinContract()" type="primary" round >Create Asobi Coin Contract</el-button>
    </el-card>
    <el-card class="create-contract-box full-centered-content">
      <el-button @click="createEscrowContract()" type="primary" round >Create Escrow Contract</el-button>
    </el-card>
  </el-main>
</template>

<script>
import dappMixin from "./../mixins/dapp";

export default {
  mixins: [dappMixin],
  data() {
    return {};
  },
  methods: {
    createGoodsContract() {
      this.$store.dispatch("createGoodsContract");
    },
    createAsobiCoinContract() {
      this.$store.dispatch("createAsobiCoinContract");
    },
    createEscrowContract() {
      this.$store.dispatch("createEscrowContract");
    },
  },
};
</script>

<style lang="stylus" scoped>
.add-contract
  min-width 400px
  margin-bottom 20px

.create-contract-box
  min-width 400px
</style>
