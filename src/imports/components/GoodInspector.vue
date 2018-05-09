<template>
<div class="good-inspector" :class="{closed : !open}">
  <div class="drawer">
    <transition>
    <div class="content" v-if="good">
      <good-item class="good-item" v-bind="good" :active="true"/>

      <div class="infos">
        <h1>Name{{good.name}}</h1>
        <div v-if="good.isOwned">
          <el-input-number v-model="good.price" controls-position="right" @change="priceChanged()" :min="1" ></el-input-number>
          <el-switch
            v-model="good.forSale"
            active-text="For Sale"
            @change="onGoodForSaleChanged(good)"
            />
        </div>
        <div v-else-if="good.forSale">
          <span class="price">{{good.price}}</span>
          <el-button @click="buyGood(good)" round>BUY</el-button>
        </div>
      </div>

      <el-button class="close-button" type="danger" icon="el-icon-close" circle @click="close()"></el-button>

    </div>
    </transition>
  </div>
</div>
</template>

<script>
import GoodItem from "./GoodItem.vue";

export default {
  components: {
    "good-item": GoodItem,
  },
  props: {
    good: Object,
  },
  computed: {
    open() {
      return this.good != null;
    },
  },
  methods: {
    close() {
      this.$store.commit("selectGood", null);
    },
    onGoodForSaleChanged(good) {
      this.$store.dispatch("setGoodForSale", good);
    },
    buyGood(good) {
      this.$store.dispatch("buyGood", good);
    },
    priceChanged() {
      console.log("priceChanged", this.good.price);
    },
  },
};
</script>

<style lang="stylus" scoped>
.good-inspector
  background alpha(#f00,0.0)
  position relative
  pointer-events none
  >.drawer
    pointer-events initial
    background alpha(#f0f0f0,0.9)
    position absolute
    top 0px
    left 0px
    right 0px
    bottom 0px
    box-shadow 0px 0px 40px alpha(#000,0.1), 0px 0px 4px alpha(#000,0.1)
    transition all 300ms ease-in-out

    >.content
      position absolute
      top 0px
      left 0px
      right 0px
      bottom 0px

      padding 8px

      display flex
      flex-direction row
      flex-wrap nowrap
      justify-content flex-start
      align-content stretch
      align-items stretch

      >.close-button
        position absolute
        top 8px
        right 8px
        box-shadow 0px 1px 3px alpha(#000,0.2)

      >.good-item
        width 200px
        height 200px
        margin-right 8px

      >.infos
        flex 1 1 auto
        margin-right 48px

        >h1
          // background alpha(#fff,0.8)
          height 40px
          line-height 40px
          text-transform uppercase

  &.closed
    >.drawer
      transform translate(0,100%)

</style>
