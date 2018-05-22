<template>
<div class="goods-collection" v-loading="loading">
  <div class="head">
    <h1>{{title}}</h1>
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
</template>

<script>
import draggable from "vuedraggable";
import GoodItem from "./../components/GoodItem.vue";

export default {
  components: {
    draggable,
    "good-item": GoodItem,
  },
  props: {
    title: {
      type: String,
      default: "Goods",
    },
    goods: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {},
  methods: {
    checkMove(e) {
      return true;
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

<style lang="stylus">

</style>
