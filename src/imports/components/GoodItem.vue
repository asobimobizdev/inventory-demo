<template>
<div class="good" :class="{ 'has-drawer': hasDrawer, 'active': active }">
  <div class="icon" :style="styleForIcon"></div>
  <div class="drawer" v-if="hasDrawer">
    <slot></slot>
  </div>
  <div class="for-sale-ribbon" v-if="forSale">FOR SALE</div>
</div>
</template>

<script>
import seedParams from "../lib/seedParams";

export default {
  props: {
    id: String,
    confirmed: Boolean,
    forSale: Boolean,
    hasDrawer: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    seed: { type: Number, default: 0 },
    hue: { type: Number, default: 0 },
    thumbPath: { type: String, default: null }
  },
  computed: {
    styleForIcon() {
      return {
        backgroundImage: `url(${this.thumbPath})`
      };
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
  background-color #f0f0f0

  >.icon
    background-color #eee
    width 80px
    height 80px
    // border-radius 40px
    margin-bottom 0px
    // transition all 300ms ease-in-out
    position relative
    overflow hidden
    background-size contain
    background-position center center
    background-repeat no-repeat

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

    // &:hover,&:active
    //   >.icon
    //     transform translate(0,-30px)
    //   >.drawer
    //     transform translate(0,10px)

  &.active
    >.icon
      transform scale(2,2);
</style>
