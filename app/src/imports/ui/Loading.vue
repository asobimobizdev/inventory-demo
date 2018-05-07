<template>
  <svg id="loading">
    <circle cx="50%" cy="50%" stroke="black"  fill="transparent" />
  </svg>
</template>

<script>
export default {};
</script>

<style lang="stylus" scoped>

@keyframes dash {

  to {
    // stroke-dashoffset: 0;
    transform: rotate(360deg);
  }
}

#loading
  width 60px
  height 60px
  margin 20px
  // background-color alpha(#f00,0.3)
  > circle 
    r: calc(50% - 4px)
    stroke-width 4px
    stroke-dasharray 10;
    stroke-dashoffset: 10;
    animation: dash 3s linear infinite;
    transform-origin 50% 50%
</style>
