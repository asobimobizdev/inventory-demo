<template>

<div class="host">
  <el-form v-if="isOwner" :model="form" :rules="rules" ref="form" label-width="120px" class="demo-form">
    
    <el-form-item label="Reciver" prop="receiver">
      <el-input v-model="form.receiver"></el-input>
    </el-form-item>
    <el-form-item label="Token ID" prop="tokenID">
      <el-input v-model="form.tokenID"></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm('form')">Mint</el-button>
      <el-button @click="resetForm('form')">Reset</el-button>
    </el-form-item>

    <el-alert v-if="submitMessage" title="Success" type="success" @close="successAlertClose">
      {{submitMessage}}
    </el-alert>
    
    <el-alert v-if="submitErrorMessage" title="Error" type="error" @close="errorAlertClose">
      {{submitErrorMessage}}
    </el-alert>

  </el-form>
  <div v-else>
    <h1>You are not the owner</h1>
  </div>
</div>

</template>

<style>

</style>

<script>
import dappMixin from "@/mixins/dapp";

export default {
  mixins: [dappMixin],
  data() {
    return {
      // web3 part
      isOwner: false,
      form: {
        receiver: "",
        tokenID: ""
      },
      rules: {
        receiver: [
          {
            required: true,
            message: "Please input Receiver",
            trigger: "blur"
          }
        ],

        tokenID: [
          {
            required: true,
            message: "Please input token ID",
            trigger: "blur"
          }
        ]
      },
      submitMessage: null,
      submitErrorMessage: null
    };
  },

  methods: {
    ready() {
      this.token = this.dapp.getContractAt(
        this.dapp.contracts.MintableERC721,
        "0xDB2E91f83cA869421d22E795a86b623a24c03edB"
      );
      this.token.methods
        .owner()
        .call()
        .then(ownerAddress => {
          this.isOwner = ownerAddress == this.dapp.defaultAccount;
        });
    },
    async mintToken() {
      // TODO
      // these values need to come from somewhere
      const receiverAddress = "0x0";
      const tokenID = "0";
      // end TODO
      await this.token.methods.mint(receiverAddress, tokenID).send();
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.submitMessage = `Submit! ${this.form.receiver} ${
            this.form.tokenID
          }`;
          this.submitErrorMessage = null;
          this.$refs[formName].resetFields();
        } else {
          this.submitMessage = null;

          return false;
        }
      });
    },
    resetForm(formName) {
      this.submitMessage = null;
      this.$refs[formName].resetFields();
    },
    successAlertClose() {
      this.submitMessage = null;
    },
    errorAlertClose() {
      this.submitErrorMessage = null;
    }
  }
};
</script>
