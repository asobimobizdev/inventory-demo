<template>

<div class="host">
  <el-form v-if="isOwner" :model="form" :rules="rules" ref="form" label-width="120px" class="demo-form">

    <el-form-item label="Reciver" prop="receiverAddress">
      <el-input v-model="form.receiverAddress"></el-input>
    </el-form-item>
    <el-form-item label="Token ID" prop="tokenID">
      <el-input v-model="form.tokenID"></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm('form')">Mint</el-button>
      <el-button @click="resetForm('form')">Reset</el-button>
    </el-form-item>

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
      form: {
        receiverAddress: "",
        tokenID: ""
      },
      rules: {
        receiverAddress: [
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
      }
    };
  },
  computed: {
    isOwner() {
      return this.$store.state.isMintOwner;
    }
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
                message: `Submit! ${this.form.receiverAddress} ${
                  this.form.tokenID
                }`,
                type: "success"
              });
            })
            .catch(() => {
              this.$message.error(
                `Error! ${this.form.receiverAddress} ${this.form.tokenID}`
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
