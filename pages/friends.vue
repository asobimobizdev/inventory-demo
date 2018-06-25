<template>

  <el-main class="host full-centered-content">
    <h1
      class="title"
      align="center">Friends List</h1>
    <el-table
      :data="friends"
      style="width: 100%"
      height="100"
    >
      <el-table-column
        prop="name"
        label="Name"
        width="300px"/>
      <el-table-column
        prop="id"
        label="Address"
      />
    </el-table>
    <el-card class="add-box">
      <div
        slot="header"
        class="clearfix">
        <h1 align="center">Register yourself!</h1>
      </div>
      <el-form
        ref="form"
        :inline="false"
        :model="form"
        :rules="rules"
        label-position="top"
        label-width="90px"
        @submit.prevent.native="submitForm('form')">
        <el-form-item
          label="Name"
          prop="name">
          <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item align="center">
          <el-button
            v-if="registered"
            type="danger"
            icon="el-icon-delete"
            round
            @click="unregisterUser()">
            Unregister
          </el-button>
          <el-button
            v-else
            type="primary"
            round
            @click="submitForm('form')">
            Register
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-main>
</template>

<script>
import dappMixin from "@/mixins/dapp";

export default {
  mixins: [dappMixin],
  data() {
    return {
      form: {
        name: "",
      },
      rules: {
        name: [
          {
            required: true,
            message: "Please input your name",
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
    registered() {
      return this.$store.state.registered;
    },
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate().then(valid => {
        if (!valid) {
          return;
        }
        this.$store.dispatch("addFriend", this.form);
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    createGoodForFriendAt(index) {
      const friend = this.$store.state.friends[index];
      this.$store.dispatch("createGoodFor", friend.id);
    },
    unregisterUser() {
      this.$store.dispatch("unregisterUser");
    },
    sendCoinsToFriend(index) {
      const friend = this.$store.state.friends[index];
      this.$store.dispatch("sendCoinsToFriend", { friend, amount: "100" });
    },
  },
};
</script>


<style lang="stylus" scoped>
.host
  min-height 804px
  min-width 900px

.add-box
  width 100%

.title
  margin-top 30px

</style>
