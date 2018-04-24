<template>
  <div class="host" :class="layoutClass">
    <div :name="container" class="container" >
      <div class="item" v-for="(item, index) in items" :key="index" :style="itemsStyle">
        <slot :name="['item',index].join('-')"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  components: { draggable },
  props: {
    items: Array,
    isGrid: {
      type: Boolean,
      dafault: false
    },
    groupId: { type: String, default: null }
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
        background: this.isGrid ? "#f0f0f0" : "#f0f0f0"
      };
    },

    myList: {
      get() {
        return this.items;
      },
      set(value) {
        console.log(value);
        // this.items = value;
      }
    }
  }
};
</script>

<style lang="stylus" scoped>


</style>
