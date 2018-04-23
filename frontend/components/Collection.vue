<template>
  <div class="host" :class="{ grid:isGrid }">
    <div class="container" >
      <div class="item" v-for="item in items" :key="item.id"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: Array,
    isGrid: {
      type: Boolean,
      dafault: false
    }
  },
  data() {
    return {};
  },
  computed: {}
};
</script>

<style lang="stylus" scoped>
.host
  background-color alpha(#00ff00,0.3)
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: stretch;
  align-items: stretch; 

  // overflow hidden
  overflow-x hidden
  overflow-y scroll 

  >.container
    background-color alpha(#000, 0.3)
    // height 100%

    // flex: 1 1 auto;
    padding: 4px;

    // display:grid;    
    // grid-gap: 4px;
    // grid-template-columns: repeat(auto-fit, minmax(120px,1fr));
    
    font-size:2em;
    
    >*
      background-color: #fd0;
      display:flex;
      justify-content: center;
      align-items:center;
      max-height:200px;
      height 100px
      margin 10px

      // &:before 
      //   display: block;
      //   content: "";
      //   width: 0%;
      //   padding-top: (1 / 1) * 100%;
      
  &.grid
    >.container
        display:grid;    
        padding: 4px;

        grid-gap: 4px;
        grid-template-columns: repeat(auto-fit, minmax(240px,1fr));
        
        font-size:2em;
        
      >*
        background-color alpha(#fff,0.3)
        // width 100px
        // float left




</style>
