<template>
  <el-main class="full-centered-content">
    <el-card class="create-contract-box full-centered-content">
      <el-button
        type="primary"
        round
        @click="createGoodsContract()" >Create Goods Contract</el-button>
    </el-card>
    <el-card class="create-contract-box full-centered-content">
      <el-button
        type="primary"
        round
        @click="createAsobiCoinContract()" >Create Asobi Coin Contract</el-button>
    </el-card>
    <el-card class="create-contract-box full-centered-content">
      <el-button
        type="primary"
        round
        @click="createEscrowContract()" >Create Escrow Contract</el-button>
    </el-card>
    <el-card class="create-contract-box full-centered-content">
      <el-button
        type="primary"
        round
        @click="createTradeRegistry()" >Create Trade Registry</el-button>
    </el-card>
    <el-card class="create-contract-box full-centered-content">
      <el-button
        type="primary"
        round
        @click="createUserRegistry()" >Create User Registry</el-button>
    </el-card>
  </el-main>
</template>

<script>
import dappMixin from "@/mixins/dapp";
import { mapActions } from "vuex";

export default {
  mixins: [dappMixin],
  data() {
    return {};
  },
  methods: {
    ...mapActions([
      "createGoodsContract",
      "createAsobiCoinContract",
      "createEscrowContract",
      "createTradeRegistry",
      "createUserRegistry",
    ]),
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
