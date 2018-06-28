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
            :from="balance"
            :to="balance"
            :formatter="formatter"
            duration="1000"
            easing="easeOutQuad"
          />₳
        </span>
      </header>
      <div class="spring"/>
      <main>
        <div class="spting"/>
        <transition-group
          class="content"
          tag="div"
          name="list">
          <div
            v-for="transfer in filteredTransfers"
            :key="transfer.transactionHash"
            class="item">
            <span class="amount">
              <i class="el-icon-plus"/>
              {{ transfer.value | fromWei }}₳
            </span>
            <div class="info">
              <span class="name">
                From {{ transfer.fromFriend.name }} - To {{ transfer.toFriend.name }}
              </span>
              <span class="blockNumber">
                {{ transfer.blockNumber }}
              </span>
            </div>
          </div>
        </transition-group>
        <div class="spting"/>
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
            :value="user.id"/>
        </el-select>
      </footer>

    </div>
  </section>
</template>

<script>
import { clearTimeout } from "timers";
import { mapActions, mapGetters, mapState } from "vuex";
import { sleep } from "../lib/utils";
import dappMixin from "@/mixins/dapp";
import web3Utils from "web3-utils";

export default {
  filters: {
    fromWei: value => web3Utils.fromWei(value).toString(),
  },
  mixins: [dappMixin],
  data() {
    return {
      usersFilter: [],
      loop: true,
    };
  },
  computed: {
    ...mapState(["friends", "balance"]),
    filteredTransfers() {
      let result;
      if (this.usersFilter.length == 0) {
        result = this.$store.state.live.transfers;
      } else {
        result = this.$store.state.live.transfers.filter(
          transfer =>
            this.usersFilter.find(userID => userID == transfer.from) != null,
        );
      }
      const friends = [
        {id: "0x0000000000000000000000000000000000000000", name: "Shop"},
        ...this.$store.state.friends,
      ];
      return result.map(event => {
        return {
          ...event,
          fromFriend: friends.find(f => {
            return f.id == event.from;
          }) || { name: "Unknown" },
          toFriend: friends.find(f => {
            return f.id == event.to;
          }) || { name: "Unknown" },
        };
      });
    },
  },
  watch: {
    balance(newValue, oldValue) {
      this.$refs.balance.reset(oldValue, newValue);
      this.$refs.balance.start();
    },
  },
  async mounted() {
    this.$store.dispatch("live/getTransfers");
  },
  methods: {
    formatter(num) {
      return num.toFixed(0);
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
      background: linear-gradient(to bottom, hsl(230, 80%, 60%) 0%, hsl(210, 60%, 70%) 50%,  hsl(350, 80%, 90%) 90%, hsl(10, 100%, 60%))
      // background  hsl(218, 67%, 60%)
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

      display: flex
      flex-direction: row
      flex-wrap: nowrap
      justify-content: center
      align-content: flex-start
      align-items: flex-start

      // background-color alpha(#f00,0.3)

      >.content
        display: flex
        flex-direction: column
        flex-wrap: nowrap
        justify-content: center
        align-content: center
        align-items: flex-start
        min-height 100%
        padding-bottom 120px
        // background-color alpha(#f00,0.3)

        >.item
          background-color alpha(#fff,0.9)
          height 60px
          min-height 60px
          margin 10px
          padding 8px
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

            // &:last-child
            //   margin-right 0px

          >.amount
            color #fff
            background-color primaryColor
            height 40px
            padding 8px 20px
            padding-left 10px
            border-radius 20px
            line-height 20px
          >.infd
            >.blockNumber
              color #ddd

    >footer
      display: flex
      flex-direction: column
      flex-wrap: nowrap
      justify-content: center
      align-content: center
      align-items: stretch
      padding 24px

.list-item
  display inline-block
  margin-right 10px

.list-enter-active, .list-leave-active
  transition all 3000ms cubic-bezier(0.000, 1.650, 0.380, 1.000)

.list-enter, .list-leave-to
  opacity 0
  transform translateY(-30px) scale(0.5)

.list-move
  transition: transform 1000ms cubic-bezier(0.000, 1.650, 0.380, 1.000)

</style>
