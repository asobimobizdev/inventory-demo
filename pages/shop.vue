<template>
  <el-main class="full-centered-content">
    <el-card class="box full-centered-content">
      <el-button
        type="primary"
        round
        @click="buyAsobiCoinAndGoods()">
        Buy AsobiCoin &amp; Goods
      </el-button>
    </el-card>
  </el-main>
</template>

<script>
import { mapActions } from "vuex";
import dappMixin from "@/mixins/dapp";

export default {
  mixins: [dappMixin],
  methods: {
    ...mapActions([
      "buyAsobiCoinAndGoods",
    ]),
  },
};
</script>

<style lang="stylus" scoped>
.box
  min-width 400px
</style>
