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
.goods-collection
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
      text-align center

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
    height 120px

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
</style>
