<template>
  <section class="host">
    <div class="content">

      <div class="goods-collection my-goods" v-loading="goodsLoading">
        <div class="head">
          <h1>My Goods</h1>
        </div>
        <div class="collection grid" >
          <draggable
            v-model='allGoods'
            class="container"
            id="goodsContainer"
            :options="{group:'goods', scroll: true, forceFallback:true, sort:false }"
            :move="checkMove"
            @end="onDrop">
            <div class="item"
              v-for="(good,index) in allGoods"
              :key="index"
              @click="selectGood(good)">
              <good-item v-bind="good" :active="isGoodSelected(good)">
              </good-item>
            </div>
          </draggable>
        </div>
      </div>

      <div class="goods-collection friend-goods"
          v-if="hasFriends"
          v-loading="friendGoodsLoading">
        <div class="head">
          <el-select v-model="selectedFriendIndex" placeholder="Select a Friend">
            <el-option
              v-for="(friend, index) in otherUsers"
              :key="index"
              :label="friend.name"
              :value="index">
            </el-option>
          </el-select>
        </div>
        <div class="collection list" >
          <draggable
            v-model='friendGoods'
            class="container"
            id="friendGoodsContainer"
            :options="{group:'goods', scroll: true, forceFallback:true, sort:false }"
            :move="checkMoveFromFriendGoods">
            <div
              class="item"
              v-for="(good, index) in friendGoods"
              :key="index"
              @click="selectGood(good)">
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
import { mapActions, mapState, mapGetters } from "vuex";
import draggable from "vuedraggable";
import GoodItem from "./../components/GoodItem.vue";
import GoodInspector from "./../components/GoodInspector.vue";

export default {
  mounted() {
    this.$store.dispatch("getOwnGoods", true);

    if (this.otherUsers.length > 0) {
      this.checkSelectedFriend(this.otherUsers);
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
    ...mapGetters([
      "otherUsers",
    ]),
    ...mapState([
      "goodsLoading",
    ]),
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
