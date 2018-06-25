<template>
  <div 
    v-loading="loading" 
    class="goods-collection">
    <div class="head">
      <h1>{{ title }}</h1>
    </div>
    <div class="collection grid" >
      <draggable 
        id="goodsContainer" 
        v-model="goods" 
        :options="{group:'goods',scroll: true, forceFallback:true, sort:false }" 
        :move="checkMove" 
        class="container" 
        @end="onDrop">
        <div 
          v-loading="!good.confirmed" 
          v-for="(good,index) in goods" 
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
</template>

<script>
import GoodItem from "./../components/GoodItem.vue";
import draggable from "vuedraggable";

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
