<template>

<el-main class="host full-centered-content">

  <el-card class="add-box">
    <div slot="header" class="clearfix">
      <h1 align="center">Add a Friend!</h1>
    </div>
    <el-form :inline="false" label-position="top" :model="form" :rules="rules" ref="form" label-width="90px" class="demo-form">

      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>

      <el-form-item label="Address" prop="id">
        <el-input v-model="form.id"></el-input>
      </el-form-item>

      <el-form-item align="center">
        <el-button type="primary" @click="submitForm('form')" round>Add</el-button>
      </el-form-item>

    </el-form>
  </el-card>

  <h1 class="title" align="center">Friends List</h1>
  <el-table
    :data="friends"
    style="width: 100%"
    height="100"
    >
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
      width="240"
      align="right"
      >
      <template slot-scope="scope" >
        <el-button v-if="isAsobiCoinAdmin" @click="sendCoinsToFriend(scope.$index)" type="warning" icon="el-icon-plus" round>100 ₳</el-button>
        <el-button v-if="isGoodsAdmin" @click="createGoodForFriendAt(scope.$index)" type="success" icon="el-icon-plus" circle></el-button>
        <el-button @click="deleteFriendAt(scope.$index)" type="danger" icon="el-icon-delete" circle></el-button>
      </template>
    </el-table-column>
  </el-table>


</el-main>
</template>

<script>
import dappMixin from "./../mixins/dapp";
export default {
  mixins: [dappMixin],
  mounted() {
    this.$store.dispatch("getFriends");
    this.$store.dispatch("checkGoodsAdmin");
    this.$store.dispatch("checkAsobiCoinAdmin");
  },
  data() {
    return {
      form: {
        id: "",
        name: "",
      },
      rules: {
        id: [
          {
            required: true,
            message: "Please input friend name",
            trigger: "blur",
          },
        ],

        name: [
          {
            required: true,
            message: "Please input friend address",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    friends() {
      return this.$store.state.friends;
    },
    isGoodsAdmin() {
      return this.$store.state.isGoodsAdmin;
    },
    isAsobiCoinAdmin() {
      return this.$store.state.isAsobiCoinAdmin;
    },
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) return;

        this.$store.dispatch("addFriend", this.form);
        this.resetForm(formName);
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    createGoodForFriendAt(index) {
      const friend = this.$store.state.friends[index];
      this.$store.dispatch("createGoodFor", friend.id);
    },
    deleteFriendAt(index) {
      const friend = this.$store.state.friends[index];
      this.$store.dispatch("deleteFriend", friend);
    },
    sendCoinsToFriend(index) {
      const friend = this.$store.state.friends[index];
      this.$store.dispatch("sendCoinsToFriend", { friend, amount: "100" });
    },
  },
};
</script>


<style lang="stylus" scoped>
.add-box
  width 100%

.title
  margin-top 30px

</style>
