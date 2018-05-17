<template>
<el-container class="host">
  <el-aside>
    <goods-collection class="my-goods" :goods="goods" title="My Goods"/>
  </el-aside>

  <el-container class="trande-container">
    <el-header>
      <transition :name="toolBarSlideAnimationType">
        <div class="content center" v-if="!offersShowed" key="user-list">
          <h1>Users list</h1>
        </div>
        <div class="content" v-else key="trade-view">
          <el-button class="back-button" type="primary" round @click="backToUserList()" icon="el-icon-arrow-left">User list</el-button>
        </div>
      </transition>
    </el-header>
    <el-main >

      <transition :name="slideAnimationType">
        <div class="content user-list" v-if="!offersShowed" key="user-list">
          <el-table
            :data="friends"
            class="table"
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
          <goods-collection class="my-offer" :goods="selectedMyOffer" title="My Offer"/>
          <goods-collection class="user-offer" :goods="[]" title="[username] Offer"/>
        </div>
      </transition>

    </el-main>

    <el-footer>
      <transition :name="toolBarSlideAnimationType">
        <div class="content center" v-if="!offersShowed" key="user-list">
          <el-button type="primary" round @click="startTrade()">Start Trade</el-button>
        </div>
        <div class="content center" v-else key="trade-view">
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
export default {
  components: {
    "goods-collection": GoodsCollection,
  },
  mounted() {
    this.$store.dispatch("getOwnGoods", true);
  },
  data() {
    return {
      offersShowed: false,
    };
  },
  computed: {
    goods: {
      get() {
        return this.$store.getters.allGoods;
      },
      set(value) {},
    },
    friends() {
      return this.$store.state.friends;
    },
    selectedMyOffer: {
      get() {
        return this.$store.getters.allGoods;
      },
      set(value) {
        console.log("selectedMyOffer", value);
      },
    },
    slideAnimationType() {
      return this.offersShowed ? "slide-left" : "slide-right";
    },
    toolBarSlideAnimationType() {
      return this.offersShowed ? "tool-bar-slide-left" : "tool-bar-slide-right";
    },
  },
  methods: {
    startTrade() {
      this.offersShowed = true;
    },
    backToUserList() {
      this.offersShowed = false;
    },
    cancelTrade() {
      this.offersShowed = false;
    },
    confirmTrade() {
      this.offersShowed = false;
    },
  },
};
</script>


<style lang="stylus" scoped>

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
  padding 5px

  >.el-aside
    // background alpha(#f00,0.3)
    padding 5px
    display flex
    >.my-goods
      flex 1 1 auto

  >.trande-container
    padding 5px

    >.el-header
      background #fff
      height 60px
      fullSizeContent()
      >.content
        padding 10px
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
        padding 10px

        >*
          margin-right 5px
          flex 1 1 auto

          &:last-child
            margin-right 0px

        &.user-list
          background #fff
          display flex
          padding-bottom 0px

          >.table
            border-top 1px solid alpha(#000, 0.1)
            flex 1 1 auto
            height 100%



    >.el-footer
      background #fff
      padding 10px
      display flex
      height 60px
      fullSizeContent()
      >.content
        padding 10px




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
