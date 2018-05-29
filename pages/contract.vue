<template>
  <el-main class="full-centered-content">
    <el-card class="create-contract-box full-centered-content">
      <el-button
        type="primary"
        round
        @click="createContracts()" >Create Contracts</el-button>
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
      "createContracts",
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
