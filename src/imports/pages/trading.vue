<template>
<el-container class="host">
  <el-aside>
    <goods-collection class="my-goods" :goods="goods" title="My Goods"/>
  </el-aside>

  <el-container class="trande-container">
    <el-header>
      <transition :name="toolBarSlideAnimationType">
        <div class="content center" v-if="!hasTrade" key="user-list">
          <h1>Users list</h1>
        </div>
        <div class="content center" v-else key="trade-view">
          <h1>Trade</h1>
        </div>
      </transition>
    </el-header>
    <el-main >

      <transition :name="slideAnimationType">
        <div class="content user-list" v-if="!hasTrade" key="user-list">
          <el-table
            ref="usersTable"
            :data="otherUsers"
            class="table"
            highlight-current-row
            @current-change="userTableSelectionChanged"
            current-row-key="id"
            @mounted="userTableMounted"
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
          </el-table>
        </div>
        <div class="content" v-else key="trade-view">
          <goods-collection class="my-offer" :goods="myOffer" title="My Offer"/>
          <goods-collection class="user-offer" :goods="otherOffer" :title="otherUser.name + ' Offer'"/>
        </div>
      </transition>

    </el-main>

    <el-footer>
      <transition :name="toolBarSlideAnimationType">
        <div class="content center" v-if="!hasTrade" key="user-list">
          <el-button type="primary" round @click="startTradeWithSelectedUser()" v-if="selectedFriendId">Start Trade</el-button>
        </div>
        <div class="content center trade-view" v-else key="trade-view">
          <el-button type="danger" round @click="cancelTrade()">Cancel Trade</el-button>
          <el-button type="success" round @click="confirmTrade()">Confirm Trade</el-button>
        </div>
      </transition>
    </el-footer>
  </el-container>

 </el-container>
</template>

<script>
import GoodsCollection from "./../components/GoodsCollection.vue";
import { mapActions, mapState, mapGetters } from "vuex";

export default {
  components: {
    "goods-collection": GoodsCollection
  },
  mounted() {
    this.$store.dispatch("getOwnGoods", true);
    if (this.selectedUser) {
      this.$refs.usersTable.setCurrentRow(this.selectedUser);
    }
  },
  computed: {
    ...mapState(["selectedFriendId"]),
    ...mapGetters(["otherUsers"]),
    ...mapGetters("trade", ["otherUser"]),
    hasTrade() {
      return this.$store.state.trade.id;
    },
    goods: {
      get() {
        return this.$store.getters.allGoods;
      },
      set(value) {}
    },
    myOffer: {
      get() {
        return this.$store.state.trade.myGoods;
      },
      set(value) {
        console.log("selectedMyOffer", value);
      }
    },
    otherOffer: {
      get() {
        return this.$store.state.trade.otherGoods;
      },
      set(value) {
        // console.log("selectedMyOffer", value);
      }
    },
    slideAnimationType() {
      return this.hasTrade ? "slide-left" : "slide-right";
    },
    toolBarSlideAnimationType() {
      return this.hasTrade ? "tool-bar-slide-left" : "tool-bar-slide-right";
    }
  },
  methods: {
    ...mapActions("trade", [
      "startTradeWithSelectedUser",
      "cancelTrade",
      "confirmTrade"
    ]),
    userTableSelectionChanged(user) {
      this.$store.dispatch("selectedFriendId", user.id);
    },
    userTableMounted() {
      console.log("userTableMounted");
    }
  },
  watch: {
    selectedUser(user) {
      this.$refs.usersTable.setCurrentRow(user);
    }
  }
};
</script>

<style lang="stylus" scoped>

gutter = 4px

fullSizeContent()
  display flex
  padding 0
  position relative
  overflow hidden
  >.content
    // background-color alpha(#f00,0.3)
    display flex
    width 100%
    height 100%
    position absolute

    &.center
      justify-content center

.host
  width 100%
  min-height calc(100% - 100px)
  display flex
  background-color #ccc
  padding gutter

  >.el-aside
    // background alpha(#f00,0.3)
    padding gutter
    display flex
    >.my-goods
      flex 1 1 auto

  >.trande-container
    padding gutter

    >.el-header
      background #fff
      height 56px!important
      fullSizeContent()
      >.content
        padding gutter*2
        display flex

        h1
          line-height 40px

        >.back-button
          padding-left 10px

    >.el-main
      padding 0px
      background alpha(#fff,0.5)

      fullSizeContent()
      >.content
        padding gutter*2

        >*
          margin-left (gutter / 2)
          margin-right (gutter / 2)
          flex 1 1 auto

          &:nth-child(1)
            margin-left 0px

          &:last-child
            margin-right 0px

        &.user-list
          background #fff
          display flex
          padding-top 0px
          padding-bottom 0px

          >.table
            border-top 1px solid alpha(#000, 0.1)
            flex 1 1 auto
            height 100%

    >.el-footer
      background #fff
      // padding gutter*2
      display flex
      height 56px!important
      fullSizeContent()
      >.content
        padding gutter*2

        &.trade-view
          >*
            width 140px
</style>

<style lang="stylus">
.slide-left-enter-active, .slide-left-leave-active, .slide-right-enter-active, .slide-right-leave-active
  transition all 0.3s ease-in-out

.slide-left-enter
  transform translateX(100%);

.slide-left-leave-to
  transform translateX(-100%);

.slide-right-enter
  transform translateX(-100%);

.slide-right-leave-to
  transform translateX(100%);

.tool-bar-slide-left-enter-active, .tool-bar-slide-left-leave-active, .tool-bar-slide-right-enter-active, .tool-bar-slide-right-leave-active
  transition all 0.3s ease-in-out
  opacity 1

.tool-bar-slide-left-enter
  transform translateX(20px);
  opacity 0

.tool-bar-slide-left-leave-to
  transform translateX(-20px);
  opacity 0

.tool-bar-slide-right-enter
  transform translateX(-20px);
  opacity 0

.tool-bar-slide-right-leave-to
  transform translateX(20px);
  opacity 0

</style>
