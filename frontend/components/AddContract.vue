<template>

  <el-card class="add-box">

    <div slot="header" class="clearfix">
      <h1 align="center">Add Contract!</h1>
    </div>

    <el-form :inline="false" label-position="top" :model="form" :rules="rules" ref="form" label-width="90px" class="demo-form">

      <el-form-item label="Address" prop="address">
        <el-input v-model="form.address"></el-input>
      </el-form-item>


      <el-form-item align="center">
        <el-button type="primary" @click="submitForm('form')" round>Add</el-button>
      </el-form-item>

    </el-form>
  </el-card>

</template>

<script>
export default {
  data() {
    return {
      form: {
        address: ""
      },
      rules: {
        address: [
          {
            required: true,
            message: "Please input a contract address",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) return;

        this.$store.dispatch("setContract", this.form.address);

        this.$message({
          message: `Address ${this.form.address} saved!`,
          type: "success"
        });

        this.resetForm(formName);
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style lang="stylus" scoped>

</style>
