<template>
  <section class="host">
    <div class="content">

      <div class="goods" v-loading="goodsLoading">
        <div class="head">
          <h1>My Goods</h1>
        </div>
        <div class="collection grid" >
          <draggable v-model='goods' class="container" id="goodsContainer" :options="{group:'goods',scroll: true, forceFallback:true, sort:false }" :move="checkMove" @end="onDrop">
            <div class="item" v-for="(good,index) in goods" :key="index" v-loading="!good.confirmed" @click="selectGood(good)">
              <good-item v-bind="good" :active="isGoodSelected(good)">
              </good-item>
            </div>
          </draggable>
        </div>
      </div>

      <div class="friend-goods" v-if="hasFriends" v-loading="friendGoodsLoading">
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
        <div class="collection list" >
          <draggable v-model='friendGoods' class="container" id="friendGoodsContainer" :options="{group:'goods',scroll: true, forceFallback:true, sort:false }" :move="checkMoveFromFriendGoods">
            <div class="item" v-for="(good,index) in friendGoods" :key="index" v-loading="!good.confirmed" @click="selectGood(good)">
              <good-item v-bind="good" :active="isGoodSelected(good)">
              </good-item>
            </div>
          </draggable>
        </div>
      </div>

      <good-inspector class="good-inspector" :good="selectedGood"></good-inspector>

    </div>
  </section>
</template>

<script>
import draggable from "vuedraggable";
import GoodItem from "./../components/GoodItem.vue";
import GoodInspector from "./../components/GoodInspector.vue";

export default {
  mounted() {
    this.$store.dispatch("getOwnGoods",true);

    if(this.friends.length > 0){
      this.checkSelectedFriend(this.friends);
    }
  },
  components: {
    draggable,
    "good-item": GoodItem,
    "good-inspector": GoodInspector,
  },
  data() {
    return {};
  },
  computed: {
    friends() {
      const friends = this.$store.state.friends.filter(friend => {
        return friend.id !== this.$store.state.accountAddress;
      });
      return friends;
    },
    hasFriends() {
      return this.$store.state.friends.length > 0;
    },
    selectedFriendIndex: {
      get() {
        const id = this.$store.state.selectedFriendId;
        const friendIndex = this.friends.findIndex(friend => {
          return friend.id == id;
        });
        return friendIndex;
      },
      set(value) {
        const friend = this.friends.find((friend, index) => {
          return index == value;
        });

        this.$store.dispatch("selectedFriendId", friend.id);
      },
    },
    goods: {
      get() {
        return this.$store.getters.allGoods;
      },
      set(value) {},
    },
    goodsLoading() {
      return this.$store.state.goodsLoading;
    },
    friendGoods: {
      get() {
        return this.$store.getters.allFriendGoods;
      },
      set(value) {},
    },
    friendGoodsLoading() {
      return this.$store.state.friendGoodsLoading;
    },
    selectedGood() {
      return this.$store.getters.selectedGood;
    },
  },
  watch: {
    friends(friends) {
      this.checkSelectedFriend(friends);
    },
  },
  methods: {
    checkSelectedFriend(friends){
      console.log("checkSelectedFriend");
      if (friends.length < 0) return;
      if (!this.$store.state.selectedFriendId) {
        const selectedFriendId = friends.length > 0 ? friends[0].id : null;
        this.$store.dispatch("selectedFriendId", selectedFriendId);
      }
    },
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
      const good = this.goods[oldIndex];

      if (!good.confirmed) return;

      this.$store.dispatch("transferGoodToSelectedFriend", good);
    },
    selectGood(good) {
      this.$store.commit("selectedGoodId", good.id);
    },
    isGoodSelected(good) {
      if (!this.$store.state.selectedGoodId || !good) return false;
      return good.id == this.$store.state.selectedGoodId;
    },
  },
};
</script>

<style lang="stylus" scoped>
@keyframes icon-rotation
  from
    transform rotate(0deg)
  to
    transform rotate(360deg)

.host
  width 100%
  min-height calc(100% - 100px)
  display flex
  background-color #fff

  >.content
    inMargin = 4px
    background-color #eee
    width 100%
    padding inMargin
    display flex

    position relative
    >.good-inspector
      position absolute
      bottom inMargin * -1
      left inMargin * -1
      right inMargin * -1
      height 216px

.goods, .friend-goods
  display flex
  flex-direction column
  flex-wrap nowrap
  justify-content flex-start
  align-content stretch
  align-items stretch

  &.el-loading-parent--relative >.el-loading-mask
    top 60px !important

  .head
    background-color #fff
    height 60px
    padding 10px

    >h1
      line-height 40px

    position relative
    &:after
      content: ""
      position absolute
      height 16px
      background linear-gradient(180deg, alpha(#000,0.05), alpha(#000,0)), linear-gradient(180deg, alpha(#000,0.02) 0%, alpha(#000,0) 20%)
      left 0
      right 0
      bottom -16px
      pointer-events none

  .collection
    flex 1 1 auto

  .item
    color #fff
    background-color alpha(#fff,0.9)
    overflow hidden
    padding 0px
    position relative
    cursor pointer

    >.good
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
        margin-bottom 0px
        // animation-name icon-rotation
        // animation-duration 20s
        // animation-iteration-count infinite
        // animation-timing-function linear
        transition all 300ms ease-in-out

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

        transition all 1000ms cubic-bezier(0.000, 1.650, 0.380, 1.000)
        transform translate(0,20px)

      &:hover,&:active
        >.icon
          transform translate(0,-10px)
        >.label
          transform translate(0,0px)

.goods
  height 100%
  flex 1 1 auto
  margin-right 8px
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

<style lang="stylus">

.goods, .friend-goods
  &.el-loading-parent--relative >.el-loading-mask
    top 60px !important

</style>
