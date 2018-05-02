<template>
<div class="good" :style="styleForBg">
  <div class="icon" :style="styleForIcon"></div>
  <div class="label">{{id}}</div>
</div>
</template>

<script>
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
    }
  },

  methods: {
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
