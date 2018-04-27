<template>
  <section class="host">
    <div class="content">

      <div class="goods">
        <div class="head">
          <h1>My Goods</h1>
        </div>
        <div class="collection grid">
          <draggable v-model='goods' class="container" id="goodsContainer" :options="{group:'goods'}" :move="checkMove" @end="onDrop">
            <div class="item" v-for="(good) in goods" :key="good.id" :style="styleForBgGood(good)">
              <div class="good">
                <div class="icon" :style="styleForIconGood(good)"></div>
                <div class="label">{{good.id}}</div>
              </div>
            </div>
          </draggable>
        </div>
      </div>

      <div class="friend-goods" v-if="hasFriends">
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
          <draggable v-model='friendGoods' class="container" id="friendGoodsContainer" :options="{group:'goods',scroll: true }" :move="checkMoveFromFriendGoods">
            <div class="item" v-for="(good) in friendGoods" :key="good.id" v-loading="!good.confirmed" :style="styleForBgGood(good)">
              <div class="good">
                <div class="icon" :style="styleForIconGood(good)"></div>
                <div class="label">{{good.id}}</div>
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
    this.$store.dispatch("getSelectedFriendGoods");
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
    hasFriends() {
      return this.$store.state.friends.length > 0;
    },
    selectedFriendIndex: {
      get() {
        return this.$store.state.selectedFriendIndex;
      },
      set(value) {
        this.$store.dispatch("selectFriend", value);
      }
    },
    goods: {
      get() {
        return this.$store.state.goods;
      },
      set(value) {}
    },
    friendGoods: {
      get() {
        return this.$store.state.friendGoods;
      },
      set(value) {}
    }
  },
  methods: {
    checkMove(e) {
      return true;
    },
    checkMoveFromFriendGoods(e) {
      return false;
    },
    onDrop(e) {
      const from = e.from.id;
      const to = e.to.id;
      if (from != "goodsContainer" || to != "friendGoodsContainer") {
        return;
      }
      const oldIndex = e.oldIndex;
      const good = this.$store.state.goods[oldIndex];

      this.$store.dispatch("transferGoodToSelectedFriend", good);
    },
    styleForBgGood(good) {
      let seed = this.stringToHashNumber(good.id);
      let angle = (seed * 1330.443445) % 120 - 60;
      let colorH = (seed * 156.4223445) % 360;
      let startColor = `hsl(${colorH - 20}, 60%, 80%)`;
      let stopColor = `hsl(${colorH + 70},  90%, 70%)`;
      return {
        background: `linear-gradient(${angle}deg, ${startColor}, ${stopColor})`
      };
    },
    styleForIconGood(good) {
      let seed = this.stringToHashNumber(good.id);
      let angle = (seed * 130.43445) % 360;
      let colorH = (seed * 156.4223445) % 360;
      let startColor = `hsl(${colorH},     80%, 70%)`;
      let stopColor = `hsl(${colorH + 70}, 80%, 70%)`;
      let shadowColor = `hsla(${colorH + 80}, 100%, 40%,0.2)`;
      let shadowColor2 = `hsla(${colorH}, 90%, 30%,0.1)`;
      let shadowColor3 = `hsla(${colorH + 80}, 90%, 90%,0.05)`;
      return {
        background: `linear-gradient(${angle}deg, ${startColor}, ${stopColor})`,
        boxShadow: `0 4px 18px ${shadowColor}, 0 1px 4px ${shadowColor2}, inset 0 0px 0px 1px ${shadowColor3}`
      };
    },
    stringToHashNumber(str) {
      str = String(str);
      return str
        .split("")
        .map(it => {
          return it.charCodeAt(0) * 0.12345678;
        })
        .reduce((a, b) => {
          return (a * b) % (Number.MAX_VALUE - 1);
        });
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
  display flex
  flex-direction column
  flex-wrap nowrap
  justify-content flex-start
  align-content stretch
  align-items stretch

  .head
    background-color #fff
    height 60px
    padding 10px
    >h1
      line-height 40px
  .collection
    flex 1 1 auto

  .item
    color #fff
    background-color alpha(#fff,0.9)
    overflow hidden
    padding 0px
    position relative
    >*
      display flex
      flex-direction column
      flex-wrap wrap
      justify-content center
      align-content center
      align-items center
      position absolute
      top 0
      left 0
      right 0
      bottom 0

      >.icon
        background-color #f88
        width 80px
        height 80px
        border-radius 40px
        margin-bottom 20px
        // box-shadow 0 1px 2px alpha(#000,0.1)

      >.label
        display block
        margin 0
        padding 0 10px
        text-align center
        background-color alpha(#fff,0.1)
        line-height 20px
        height 20px
        letter-spacing 0.1em
        white-space nowrap
        overflow hidden
        text-overflow ellipsis

        position absolute

        bottom 0
        left 0
        right 0

.goods
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

</style>
