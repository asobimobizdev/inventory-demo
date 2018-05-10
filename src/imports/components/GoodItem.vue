<template>
<div class="good" :style="styleForBg" :class="{ 'has-drawer': hasDrawer, 'active': active }">
  <div class="icon" :style="styleForIcon">
    <div class="chars">
      <div v-for="(char,index) in characteristics" :key="index" :style="styleForCt(char)"></div>
    </div>
  </div>
  <div class="drawer" v-if="hasDrawer">
    <slot></slot>
  </div>
  <div class="for-sale-ribbon" v-if="forSale">FOR SALE</div>
</div>
</template>

<script>
import randGen from "random-seed";

export default {
  props: {
    id: String,
    confirmed: Boolean,
    forSale: Boolean,
    hasDrawer: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    seed: { type: Number, default: 0 },
    hue: { type: Number, default: 0 }
  },
  computed: {
    styleForBg() {
      let seed = this.seed;
      let angle = (seed * 1330.443445) % 120 - 60;
      let colorH = this.hue;
      let startColor = `hsl(${colorH - 20}, 60%, 80%)`;
      let stopColor = `hsl(${colorH + 70},  90%, 70%)`;
      return {
        background: `linear-gradient(${angle}deg, ${startColor}, ${stopColor})`
      };
    },
    styleForIcon() {
      let seed = this.seed;
      let angle = (seed * 130.43445) % 360;
      let colorH = this.hue;
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
    characteristics() {
      const minCount = 3;
      const maxCount = 11;
      const numItems = this.random.intBetween(minCount, maxCount);
      const normNumItems = (numItems - minCount) / (maxCount - minCount);

      const items = Array(numItems)
        .fill({})
        .map((it, i) => {
          return {
            x: this.random.floatBetween(-1, 1),
            y: this.random.floatBetween(-1, 1),
            r: this.random.floatBetween(0.01, 1.6),
            deg: this.random.floatBetween(0, 360),
            opacity: this.random.floatBetween(0.1, 0.7),
            normCount: normNumItems,
            // color: this.random(100) > 0 ? "255" : "0"
            color: "255"
          };
        });
      return items;
    },
    random() {
      return new randGen(this.seed);
    }
  },

  methods: {
    styleForCt(ct) {
      const scale = 50;
      const colorStr = `${ct.color},${ct.color},${ct.color}`;
      return {
        transform: `matrix( ${ct.r}, 0, 0, ${ct.r}, ${ct.x * scale}, ${ct.y *
          scale})`,
        background: `linear-gradient(${
          ct.deg
        }deg, rgba(${colorStr},${ct.opacity /
          (ct.normCount + 1)}),  rgba(${colorStr},0.0) )`
      };
    }
  }
};
</script>


<style lang="stylus" scoped>
.good
  *
    transition all 1000ms cubic-bezier(0.000, 1.650, 0.380, 1.000)

  display flex
  flex-direction column
  flex-wrap wrap
  justify-content center
  align-content center
  align-items center
  min-width 100px
  min-height 100px
  position relative
  overflow hidden

  >.icon
    background-color #f88
    width 80px
    height 80px
    border-radius 40px
    margin-bottom 0px
    // transition all 300ms ease-in-out
    position relative
    overflow hidden
    .chars
      position absolute
      top 0
      left 0
      width 100%
      height 100%

      >div
        position absolute
        border-radius 50%
        transform translate(-50%, -50%)
        top -10px
        left -10px
        width 100px
        height 100px

  >.drawer
    display none

  >.for-sale-ribbon
    fillColor = #f21;

    position absolute
    background alpha(fillColor,0.6);
    top -20px
    right -23px
    height 20px
    line-height 20px
    padding 0 10px
    transform-origin 0 100%
    transform rotate(45deg)
    width 80px
    text-align center
    color #fff
    box-shadow 0px 1px 6px alpha(darken(fillColor, 40%),0.3)
    font-size 8px
    font-weight bold
    letter-spacing 0.1em


  &.has-drawer
    >.drawer
      display block
      margin 0
      padding 0 10px
      text-align center
      background-color alpha(#fff,0.8)
      line-height 60px
      height 70px
      letter-spacing 0.1em
      white-space nowrap
      overflow hidden
      text-overflow ellipsis

      position absolute

      bottom 0
      left 0
      right 0

      // transition transform 1000ms cubic-bezier(0.000, 1.650, 0.380, 1.000)
      transform translate(0,70px)

    &:hover,&:active
      >.icon
        transform translate(0,-30px)
      >.drawer
        transform translate(0,10px)

  &.active
    >.icon
      transform scale(2,2);
</style>
