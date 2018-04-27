<template>
  <el-main class="full-centered-content">
    <add-contract class="add-contract" ></add-contract>
    <el-card class="create-contract-box full-centered-content">
      <el-button @click="createContract()" type="primary" round >Create NFT</el-button>
    </el-card>
  </el-main>
</template>

<script>
import dappMixin from "@/mixins/dapp";
import AddContract from "@/components/AddContract.vue";

export default {
  mixins: [dappMixin],
  components: {
    "add-contract": AddContract,
  },
  data() {
    return {};
  },
  methods: {
    createContract() {
      this.$store.dispatch("createContract");
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
