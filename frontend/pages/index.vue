<template>
  <section class="host">
    <div class="content">
      
      <div class="goods">
        <div class="head">
          <h1>My Goods</h1>
        </div>
        <div class="collection grid">
          <draggable v-model='goods' class="container" id="goodsContainer" :options="{group:'goods'}" :move="checkMove" @end="onDrop">
            <div class="item" v-for="(good) in goods" :key="good.id">
              <div class="good" :style="styleForGood(good)">
                <div class="icon"></div>
                <label>{{good.id}}</label>
              </div>
            </div>
          </draggable>
        </div>
      </div>

      <div class="friend-goods">
        <div class="head">
          <el-select v-model="selectedFriendIndex" placeholder="Select a Friend">
            <el-option
              v-for="(friend, index) in friends"
              :key="index"
              :label="friend.name"
              :value="index">
            </el-option>
          </el-select>

        </div>
        <div class="collection list">
          <draggable v-model='friendGoods' class="container" id="friendGoodsContainer" :options="{group:'goods'}" :move="checkMoveFromFriendGoods">
            <div class="item" v-for="(good) in friendGoods" :key="good.id" v-loading="!good.confirmed">
              <div class="good" :style="styleForGood(good)">
                <div class="icon"></div>
                <label>{{good.id}}</label>
              </div>
            </div>
          </draggable>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
import draggable from "vuedraggable";

import Collection from "@/components/Collection.vue";
import dappMixin from "@/mixins/dapp";

export default {
  mixins: [dappMixin],
  mounted() {
    this.$store.dispatch("getOwnGoods");
    this.$store.dispatch("getFriends");
    // this.$store.dispatch("getSelectedFriendIndexGoods");
  },
  components: {
    collection: Collection,
    draggable
  },
  data() {
    return {};
  },
  computed: {
    friends() {
      return this.$store.state.friends;
    },
    selectedFriendIndex: {
      get() {
        const friendIndex = this.$store.state.selectedFriendIndex;
        let friend = this.$store.state.friends[friendIndex];
        console.log("selected friend", friend);

        return friend;
      },
      set(value) {
        this.$store.dispatch("selectFriend", value);
      }
    },
    goods: {
      get() {
        return this.$store.state.goods;
      },
      set(value) {
        // this.$store.commit("updateGoods", value);
      }
    },
    friendGoods: {
      get() {
        return this.$store.state.friendGoods;
      },
      set(value) {}
    }
  },
  methods: {
    styleForGood(good) {
      return {};
    },
    checkMove(e) {
      return true;
      // return evt.draggedContext.element.name !== "apple";
    },
    checkMoveFromFriendGoods(e) {
      return false;
    },
    onDrop(e) {
      let from = e.from.id;
      let to = e.to.id;
      if (from != "goodsContainer" || to != "friendGoodsContainer") return;
      let oldIndex = e.oldIndex;
      let good = this.$store.state.goods[oldIndex];

      this.$store.dispatch("transferGoodToSelectedFriend", good);
      this.$store.dispatch("getSelectedFriendGoods", good);
    }
  }
};
</script>

<style lang="stylus" scoped>
.host

  width 100%
  min-height calc(100% - 100px)
  display flex
  background-color #fff

  >.content
    background-color #f0f0f0
    width 100%
    padding 4px
    display flex

.goods, .friend-goods
  .head
    background-color #fff
    height 60px
    padding 10px
    >h1
      line-height 40px

  .item
    background-color alpha(#fff,0.9)
    >*
      display flex
      flex-direction: column;
      justify-content: center;

      >.icon
        background-color #f88
        width 60px
        height 60px
        border-radius 30px
        box-shadow 0 1px 2px alpha(#000,0.1)

      >label
        text-align center

.goods
  margin-right 4px
  height 100%
  flex 1 1 auto
  >.head
    >*
      text-align center

  >.collection  
    .item
      height 120px


.friend-goods
  width 300px
  height 100%
  >.head
    >*
      width 100%
  >.collection  
    .item
      height 120px
      >*
        margin 8px
        // background-color alpha(#000,0.3)
        flex 1 1 auto

        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-content: flex-start;
        align-items: flex-end;
        height calc(100% - 16px)

        >label
          text-align center
          height 20px
          display block
          width 100%
          margin-bottom 4px
          flex 1 1 auto

        >.items
          background-color alpha(#fff,1)
          box-shadow inset 0 1px 2px rgba(#000, 0.1)
          width 100%
          height 20px
          border-radius 30px
          box-shadow 0 1px 2px alpha(#000,0.1)
          align-self: flex-end;

</style>
