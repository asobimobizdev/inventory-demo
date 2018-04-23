<template>
  <section class="host">
    <div class="content">
      <collection class="goods" :items="goods" :isGrid="true">
        <div class="good"></div>
      </collection>
      <collection class="friends" :items="friends" :isGrid="false"></collection>
      
    </div>
  </section>
</template>

<script>
// import Adoption from "~/truffle/contracts/Adoption.sol";
import Collection from "@/components/Collection.vue";

export default {
  components: { collection: Collection },
  data() {
    let goods = [];
    for (let i = 0; i < 100; i++) {
      goods.push({
        id: i
      });
    }

    let friends = [];
    for (let i = 0; i < 10; i++) {
      friends.push({
        id: i
      });
    }

    return {
      goods,
      friends
    };
  }
};
</script>

<style lang="stylus" scoped>
.host
  
  width 100%
  height 100vh
  display flex
  background-color #fff

  >.content
    background-color #f0f0f0
    width 100%
    padding 4px
    display flex

    >.goods
      margin-right 4px
      height 100%

    >.friends
      width 300px
      height 100%

</style>
