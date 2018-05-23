<template>
<section class="host">
  <div class="content">

    <header>
      <span class="label">
        Balance
      </span>
      <span class="value">
        <animate-number
          ref="balance"
          duration="1000"
          :from="balance"
          :to="balance"
          easing="easeOutQuad"
          :formatter="formatter"
        ></animate-number>₳
      </span>
    </header>
    <div class="spring"></div>
    <main>
      <div class="content">
        <div class="item" v-for="transaction in filteredTransactions" :key="transaction.id">
          <span class="name">{{transaction.fromName}}</span>
          <span class="amount"><div icon=""><i class="el-icon-plus"></i> {{transaction.amount}}₳</span>
        </div>
      </div>
    </main>
    <footer>
      <el-select
        v-model="usersFilter"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="Filter users">
        <el-option
          v-for="user in friends"
          :key="user.id"
          :label="user.name"
          :value="user.id">
        </el-option>
      </el-select>
    </footer>

  </div>
</section>
</template>

<script>
import { sleep } from "../lib/utils";
import { mapActions, mapState, mapGetters } from "vuex";
import web3 from "web3";

export default {
  data() {
    return {
      balance: 4000,
      transactions: [],
      usersFilter: [],
      loop: true,
    };
  },
  async mounted() {
    const randomUser = () => {
      const len = this.friends.length;
      const rndInx = Math.floor(Math.random() * len);
      const user = this.friends[rndInx];
      return user;
    };

    while (this.loop) {
      const delay = Math.random() * 1000 + 100;
      await sleep(delay);

      if (!this.friends || this.friends.length < 1) continue;

      const user = randomUser();
      if (!user) continue;

      const transaction = {
        id: web3.utils.randomHex(32),
        from: user.id,
        fromName: user.name,
        amount: Math.round(Math.random() * 10 + 1),
      };
      this.balance += transaction.amount;
      this.pushTransaction(transaction);
    }
  },
  computed: {
    ...mapState(["friends"]),
    filteredTransactions() {
      if (this.usersFilter.length == 0) return this.transactions;
      return this.transactions.filter(transaction => {
        return (
          this.usersFilter.find(userID => userID == transaction.from) != null
        );
      });
    },
  },
  methods: {
    formatter(num) {
      return num.toFixed(0);
    },
    pushTransaction(transaction) {
      console.log(transaction);
      this.transactions = [transaction, ...this.transactions];
    },
  },
  watch: {
    balance(newValue, oldValue) {
      this.$refs.balance.reset(oldValue, newValue);
      this.$refs.balance.start();
    },
  },
};
</script>

<style lang="stylus" scoped>
.host
  primaryColor = #208eff
  // background-color alpha(#f00,0.3)

  >.content
    display flex
    flex-direction column
    flex-wrap nowrap
    justify-content flex-start
    align-content stretch
    align-items stretch
    height 100%
    position relative

    >header, footer
      background-color alpha(#fff,0.8)
      z-index 1

    >header
      height 120px

      display: flex
      flex-direction: column
      flex-wrap: nowrap
      justify-content: center
      align-content: center
      align-items: stretch

      text-align center
      letter-spacing 0.1em

      >.label
        text-transform uppercase

      >.value
        font-size 30px
        font-weight bold
        color primaryColor

    >main
      background-color alpha(#000,0.2)
      flex 1 1 auto
      min-height 120px
      position absolute
      top 0
      left 0
      right 0
      bottom 0
      padding-top: 120px
      overflow hidden
      overflow-y auto

      >.content
        display: flex
        flex-direction: column
        flex-wrap: nowrap
        justify-content: center
        align-content: center
        align-items: center
        min-height 100%
        padding-bottom 120px

        >.item
          background-color alpha(#fff,0.9)
          height 60px
          margin 10px
          padding 8px 30px
          padding-right 16px
          border-radius 30px
          font-size 24px
          line-height 24px

          display: flex
          flex-direction: row
          flex-wrap: nowrap
          justify-content: center
          align-content: center
          align-items: center
          color primaryColor

          box-shadow 0px 2px 12px alpha(#000,0.1)

          >*
            margin-right 24px

            &:last-child
              margin-right 0px

          >.amount
            color #fff
            background-color primaryColor
            height 40px
            padding 8px 20px
            padding-left 10px
            border-radius 20px

    >footer
      display: flex
      flex-direction: column
      flex-wrap: nowrap
      justify-content: center
      align-content: center
      align-items: stretch
      padding 24px

</style>
