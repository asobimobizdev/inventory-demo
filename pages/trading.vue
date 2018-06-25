<template>
  <el-container class="host">
    <el-aside>
      <!-- <goods-collection class="my-goods" :goods="goods" title="My Goods"/> -->

      <div
        v-loading="goodsLoading"
        class="goods-collection my-goods">
        <div class="head">
          <h1>My Goods</h1>
        </div>
        <div class="collection grid" >
          <draggable
            id="myGoods"
            v-model="goods"
            :options="{group:'goods',scroll: true, forceFallback:true, sort:false }"
            :move="checkMoveOfMyGoods"
            class="container"
            @end="onMyGoodsDrop">
            <div
              v-for="(good,index) in goods"
              :key="index"
              class="item" >
              <good-item
                v-bind="good"
                :active="false"/>
            </div>
          </draggable>
        </div>
      </div>


    </el-aside>

    <el-container class="trande-container">
      <el-header>
        <transition :name="toolBarSlideAnimationType">
          <div
            v-if="!hasTrade"
            key="user-list"
            class="content center">
            <h1>Users list</h1>
          </div>
          <div
            v-else
            key="trade-view"
            class="content center">
            <h1>Trade</h1>
          </div>
        </transition>
      </el-header>
      <el-main >

        <transition :name="slideAnimationType">
          <div
            v-if="!hasTrade"
            key="user-list"
            class="content user-list">
            <el-table
              ref="usersTable"
              :data="otherUsers"
              class="table"
              highlight-current-row
              current-row-key="id"
              @current-change="userTableSelectionChanged"
              @mounted="userTableMounted"
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
          </div>
          <div
            v-else
            key="trade-view"
            class="content">
            <!-- <goods-collection class="my-offer" :goods="myOffer" title="My Offer"/> -->

            <div
              v-loading="goodsLoading"
              class="goods-collection my-offer">
              <div class="head">
                <h1>
                  My Offer
                  <small v-if="otherAccepted">
                    (Accepted)
                  </small>
                </h1>
              </div>
              <div class="collection grid" >
                <draggable
                  id="myOffer"
                  v-model="goods"
                  :options="{group:'goods',scroll: true, forceFallback:true, sort:false }"
                  :move="checkMoveOfMyGoods"
                  class="container"
                  @end="onMyGoodsDrop">
                  <div
                    v-for="(good,index) in myOffer"
                    :key="index"
                    class="item" >
                    <good-item
                      v-bind="good"
                      :active="false"/>
                  </div>
                </draggable>
              </div>
            </div>

            <!-- <goods-collection class="user-offer" :goods="otherOffer" :title="otherUser.name + ' Offer'"/> -->

            <div
              v-loading="goodsLoading"
              class="goods-collection other-offer">
              <div class="head">
                <h1>
                  {{ otherUser.name }} Offer
                  <small v-if="accepted">
                    (Accepted)
                  </small>
                </h1>
              </div>
              <div class="collection grid" >
                <div class="container">
                  <div
                    v-for="(good,index) in otherOffer"
                    :key="index"
                    class="item" >
                    <good-item
                      v-bind="good"
                      :active="false"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>

      </el-main>

      <el-footer>
        <transition :name="toolBarSlideAnimationType">
          <div
            v-if="!hasTrade"
            key="user-list"
            class="content center">
            <el-button
              v-if="selectedFriendId"
              type="primary"
              round
              @click="startTradeWithSelectedUser()">Start Trade</el-button>
          </div>
          <div
            v-else
            key="trade-view"
            class="content center trade-view">
            <el-button
              v-if="!accepted"
              type="danger"
              round
              @click="cancelTrade()">Cancel Trade</el-button>
            <el-button
              v-if="!accepted"
              type="success"
              round
              @click="confirmTrade()">Confirm Trade</el-button>
            <el-button
              v-if="accepted && otherAccepted && !pulled"
              type="success"
              round
              @click="pullGoods()">Pull Goods</el-button>
            <el-button
              v-if="pulled"
              type="success"
              round
              @click="closeTrade()">Close Trade</el-button>
          </div>
        </transition>
      </el-footer>
    </el-container>

  </el-container>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import GoodItem from "./../components/GoodItem.vue";
import GoodsCollection from "./../components/GoodsCollection.vue";
import dappMixin from "@/mixins/dapp";
import draggable from "vuedraggable";

export default {
  components: {
    draggable,
    "goods-collection": GoodsCollection,
    "good-item": GoodItem,
  },
  mixins: [dappMixin],
  computed: {
    ...mapState(["selectedFriendId", "goodsLoading"]),
    ...mapGetters(["otherUsers"]),
    ...mapGetters("trade", ["otherUser"]),
    ...mapState("trade", ["accepted", "otherAccepted", "pulled"]),
    hasTrade() {
      return this.$store.state.trade.id;
    },
    goods: {
      get() {
        return this.$store.getters.allGoods;
      },
      set(value) {},
    },
    myOffer: {
      get() {
        return this.$store.getters["trade/allMyOfferedGoods"];
      },
      set(value) {
        console.log("selectedMyOffer", value);
      },
    },
    otherOffer: {
      get() {
        return this.$store.state.trade.otherGoods;
      },
      set(value) {
        // console.log("selectedMyOffer", value);
      },
    },
    slideAnimationType() {
      return this.hasTrade ? "slide-left" : "slide-right";
    },
    toolBarSlideAnimationType() {
      return this.hasTrade ? "tool-bar-slide-left" : "tool-bar-slide-right";
    },
  },
  watch: {
    selectedUser(user) {
      this.$refs.usersTable.setCurrentRow(user);
    },
  },
  mounted() {
    this.$store.dispatch("getOwnGoods", true);
    if (this.selectedUser) {
      this.$refs.usersTable.setCurrentRow(this.selectedUser);
    }
  },
  methods: {
    ...mapActions("trade", [
      "cancelTrade",
      "closeTrade",
      "confirmTrade",
      "pullGoods",
      "startTradeWithSelectedUser",
      "withdrawTrade",
    ]),
    userTableSelectionChanged(user) {
      this.$store.dispatch("selectedFriendId", user.id);
    },
    userTableMounted() {
      console.log("userTableMounted");
    },

    checkMoveOfMyGoods(e) {
      return true;
    },
    onMyGoodsDrop(e) {
      const from = e.from.id;
      const to = e.to.id;

      const oldIndex = e.oldIndex;

      if (from == "myGoods" && to == "myOffer") {
        const good = this.goods[oldIndex];
        if (!good.confirmed) return;
        this.$store.dispatch("trade/transfereGoodToMyOffer", good);
      } else if (from == "myOffer" && to == "myGoods") {
        const good = this.myOffer[oldIndex];
        if (!good.confirmed) return;
        this.$store.dispatch("trade/transfereGoodFromMyOffer", good);
      }
    },
  },
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
  background-color #eee
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
          width 50%

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
