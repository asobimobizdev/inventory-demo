<template>
  <div class="host" :class="layoutClass">
    <div class="container" >
      <div class="item" v-for="(item, index) in items" :key="item.id" :style="itemsStyle">
        <slot :name="['item',index].join('-')"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  components: {
    draggable
  },
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
  computed: {
    layoutClass() {
      return this.isGrid ? "grid" : "list";
    },
    itemsStyle() {
      return {
        height: this.isGrid ? "120px" : "60px",
        background: this.isGrid ? "" : "#f0f0f0"
      };
    }
  }
};
</script>

<style lang="stylus" scoped>
.host
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: stretch;
  align-items: stretch; 

  overflow-x hidden
  overflow-y scroll 

  background-color: alpha(#000, 0.1)
  
  >.container
  
    >.item
      background-color: alpha(#000, 0.0)
      display flex
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: center;
      align-content: center;
      align-items: center;

      >*
        background-color #f88
        width 60px
        height 60px
        border-radius 30px
        box-shadow 0 1px 2px alpha(#000,0.1)

  &.list 
    >.container
        display grid   
        padding 4px
        grid-gap 4px
        grid-template-columns repeat(auto-fit, 1fr);
        
      >.item
        height: 60px
        display flex   

  &.grid
    >.container
        display grid   
        padding 4px
        grid-gap 4px
        grid-template-columns repeat(auto-fit, minmax(120px,1fr));
        
      >.item
        background-color alpha(#fff,0.3)
        height 120px
        margin 0px
        margin-bottom 0px

</style>
