<template>
<div class="good" :style="styleForBg">
  <div class="icon" :style="styleForIcon">
    <div class="chars">
      <div v-for="(char,index) in characteristics" :key="index" :style="styleForCt(char)"></div>
    </div>
  </div>
  <div class="label">{{id}}</div>
</div>
</template>

<script>
import randGen from "random-seed";

export default {
  props: {
    id: String,
    confirmed: Boolean
  },
  computed: {
    seed() {
      return this.stringToHashNumber(this.id);
    },
    styleForBg() {
      let seed = this.seed;
      let angle = (seed * 1330.443445) % 120 - 60;
      let colorH = (seed * 156.4223445) % 360;
      let startColor = `hsl(${colorH - 20}, 60%, 80%)`;
      let stopColor = `hsl(${colorH + 70},  90%, 70%)`;
      return {
        background: `linear-gradient(${angle}deg, ${startColor}, ${stopColor})`
      };
    },
    styleForIcon() {
      let seed = this.seed;
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
    characteristics() {
      const numItems = this.random.intBetween(3, 7);

      const items = Array(numItems)
        .fill({})
        .map((it, i) => {
          return {
            x: this.random.floatBetween(-1, 1),
            y: this.random.floatBetween(-1, 1),
            r: this.random.floatBetween(0.1, 1),
            deg: this.random.floatBetween(0, 360)
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
      return {
        width: `${ct.r * 2 * scale}px`,
        height: `${ct.r * 2 * scale}px`,
        left: `calc(50% + ${ct.x * scale}px)`,
        top: `calc(50% + ${ct.y * scale}px)`,
        background: `linear-gradient(${
          ct.deg
        }deg, rgba(255,255,255,0.3),  rgba(255,255,255,0.0) )`
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
.good
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
    transition all 300ms ease-in-out
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
