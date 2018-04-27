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
    tokenID() {
      return utils.randomHex(32);
    },
  },
  mounted() {
    this.$store.dispatch("checkMintOwner");
  },
  methods: {
    async mintToken() {
      return this.$store.dispatch("mintToken", this.form);
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.mintToken()
            .then(() => {
              this.$message({
                message: `Submit! ${this.form.address} ${
                  this.form.tokenID
                }`,
                type: "success"
              });
            })
            .catch(() => {
              this.$message.error(
                `Error! ${this.form.address} ${this.form.tokenID}`
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
