<template>
  <section class="host">
    <div class="content">

      <div
        v-loading="goodsLoading"
        class="goods-collection my-goods">
        <div class="head">
          <h1>My Goods</h1>
        </div>
        <div class="collection grid" >
          <draggable
            id="goodsContainer"
            v-model="allGoods"
            :options="{group:'goods', scroll: true, forceFallback:true, sort:false }"
            :move="checkMove"
            class="container"
            @end="onDrop">
            <div
              v-for="(good,index) in allGoods"
              :key="index"
              class="item"
              @click="selectGood(good)">
              <good-item
                v-bind="good"
                :active="isGoodSelected(good)"/>
            </div>
          </draggable>
        </div>
      </div>

      <div
        v-loading="friendGoodsLoading"
        v-if="hasFriends"
        class="goods-collection friend-goods">
        <div class="head">
          <el-select
            v-model="selectedFriendIndex"
            placeholder="Select a Friend">
            <el-option
              v-for="(friend, index) in otherUsers"
              :key="index"
              :label="friend.name"
              :value="index"/>
          </el-select>
        </div>
        <div class="collection list" >
          <draggable
            id="friendGoodsContainer"
            v-model="allFriendGoods"
            :options="{group:'goods', scroll: true, forceFallback:true, sort:false }"
            :move="checkMoveFromFriendGoods"
            class="container">
            <div
              v-for="(good, index) in allFriendGoods"
              :key="index"
              class="item"
              @click="selectGood(good)">
              <good-item
                v-bind="good"
                :active="isGoodSelected(good)"/>
              <div class="info">
                <div class="name">{{ good.name }}</div>
                <div class="spring"/>
                <div
                  v-if="good.price > 0"
                  class="price"><span class="value">{{ good.price }}₳</span></div>
              </div>
            </div>
          </draggable>
        </div>
      </div>

      <good-inspector
        :good="selectedGood"
        class="good-inspector"/>

    </div>
  </section>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex";
import draggable from "vuedraggable";
import GoodItem from "./../components/GoodItem.vue";
import GoodInspector from "./../components/GoodInspector.vue";
import dappMixin from "@/mixins/dapp";

export default {
  components: {
    draggable,
    "good-item": GoodItem,
    "good-inspector": GoodInspector,
  },
  mixins: [dappMixin],
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["otherUsers", "selectedGood"]),
    ...mapState(["friendGoodsLoading", "goodsLoading"]),
    allGoods: {
      get() {
        return this.$store.getters.allGoods;
      },
      set(value) {},
    },
    hasFriends() {
      return this.otherUsers.length > 0;
    },
    selectedFriendIndex: {
      get() {
        const id = this.$store.state.selectedFriendId;
        const friendIndex = this.otherUsers.findIndex(friend => {
          return friend.id == id;
        });
        return friendIndex;
      },
      set(value) {
        const friend = this.otherUsers.find((friend, index) => {
          return index == value;
        });

        this.$store.dispatch("selectedFriendId", friend.id);
      },
    },
    allFriendGoods: {
      get() {
        return this.$store.getters.allFriendGoods;
      },
      set(value) {},
    },
  },
  watch: {
    friends(friends) {
      this.checkSelectedFriend(friends);
    },
  },
  mounted() {
    this.$store.dispatch("getOwnGoods", true);

    if (this.otherUsers.length > 0) {
      this.checkSelectedFriend(this.otherUsers);
    }
  },
  methods: {
    checkSelectedFriend(friends) {
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
      const good = this.allGoods[oldIndex];

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

.my-goods
  height 100%
  flex 1 1 auto
  margin-right 8px
  >.head
    >*
      text-align center

.friend-goods
  width 300px
  height 100%
  >.head
    >*
      width 100%

</style>
