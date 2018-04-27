<template>
<el-main class="host full-centered-content">
  <el-form v-if="isOwner" :model="form" :rules="rules" ref="form" label-width="120px" class="demo-form">
    <el-form-item label="Receiver" prop="address">
      <el-input v-model="form.address"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm('form')">Mint</el-button>
      <el-button @click="resetForm('form')">Reset</el-button>
    </el-form-item>
  </el-form>
  <el-container v-else class="full-centered-content spring">
    <h1>You are not the owner!</h1>
  </el-container>
</el-main>
</template>

<style>
</style>

<script>
import {utils} from "web3";
import dappMixin from "@/mixins/dapp";

export default {
  mixins: [dappMixin],
  data() {
    return {
      form: {
        address: "",
      },
      rules: {
        address: [
          {
            required: true,
            message: "Please input Receiver",
            trigger: "blur"
          }
        ],

      }
    };
  },
  computed: {
    isOwner() {
      return this.$store.state.isMintOwner;
    },
  },
  mounted() {
    this.$store.dispatch("checkMintOwner");
  },
  methods: {
    generateTokenID() {
      return utils.randomHex(32);
    },
    async mintToken(address, tokenID) {
      return this.$store.dispatch("mintToken", {address, tokenID});
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const tokenID = this.generateTokenID();
          this.mintToken(this.form.address, tokenID)
            .then(() => {
              this.$message({
                message: `Submit! ${this.form.address} ${
                  tokenID
                }`,
                type: "success"
              });
            })
            .catch(() => {
              this.$message.error(
                `Error! ${this.form.address} ${tokenID}`
              );
            });

          this.$refs[formName].resetFields();
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>
