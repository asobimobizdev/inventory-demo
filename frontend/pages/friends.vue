<template>
  <div class="host">


  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <h1 align="center">Add a Friend!</h1>
    </div>
    <el-form :inline="false" :model="form" :rules="rules" ref="form" label-width="90px" class="demo-form">
      
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>

      <el-form-item label="Address" prop="id">
        <el-input v-model="form.id"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm('form')">Add</el-button>
      </el-form-item>

    </el-form>
  </el-card>


    
  <el-table
    :data="friends"
    style="width: 100%">
    <el-table-column
      prop="name"
      label="Name"
      width="300px">
    </el-table-column>
    <el-table-column
      prop="id"
      label="Address"
      >
    </el-table-column>
    <el-table-column
      fixed="right"
      label=""
      width="50">
      
      <template slot-scope="scope" align="right">
        
        <el-button @click="deleteFriendAt(scope.$index)" type="danger" icon="el-icon-delete" circle></el-button>

      </template>
    </el-table-column>
  </el-table>
  
    
  </div>
</template>

<script>
import dappMixin from "@/mixins/dapp";
export default {
  mixins: [dappMixin],
  mounted() {
    this.$store.dispatch("getGoods");
    this.$store.dispatch("getFriends");
    this.$store.dispatch("getSelectedFriendGoods");
  },
  data() {
    return {
      form: {
        id: "",
        name: ""
      },
      rules: {
        id: [
          {
            required: true,
            message: "Please input friend name",
            trigger: "blur"
          }
        ],

        address: [
          {
            required: true,
            message: "Please input friend address",
            trigger: "blur"
          }
        ]
      }
    };
  },
  computed: {
    friends() {
      return this.$store.state.friends;
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) return;

        this.$store.dispatch("addFriend", this.form);
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    deleteFriendAt(index) {
      const friend = this.$store.state.friends[index];
      this.$store.dispatch("deleteFriend", friend);
    }
  }
};
</script>


<style lang="stylus" scoped>

</style>