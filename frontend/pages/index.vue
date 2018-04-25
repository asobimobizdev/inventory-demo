<template>
  <section class="host">
    <div class="content">

      <!-- <collection class="goods" :items="goods" :isGrid="true" groupId="porco">
        <div class="good" v-for="(good, index) in goods" :slot="['item',index].join('-')" :key="good.id">
          <div class="icon"></div>
          <label>{{index}}</label>
        </div>
      </collection>

      <collection class="friends" :items="friends" :isGrid="false" groupId="porco">
        <div class="good" v-for="(friend, index) in friends" :slot="['item',index].join('-')" :key="friend.id">
          <label>{{index}}</label>
          <div class="goods" >
          </div>
        </div>
      </collection> -->

      <div class="goods collection grid">
        <draggable class="container" :options="{group:'people'}">
          <div class="item" v-for="(good, index) in goods" :key="good.id">
            <div class="good" >
              <div class="icon"></div>
              <label>{{index}}</label>
            </div>
          </div>
        </draggable>
      </div>

      <div class="friends collection list">
        <draggable class="container" :options="{group:'people'}">
          <div class="item" v-for="(friend, index) in friends" :key="friend.id">
            <div class="friend" >
              <div class="icon"></div>
              <label>{{index}}</label>
            </div>
          </div>
        </draggable>
      </div>




    </div>
  </section>
</template>

<script>
import draggable from "vuedraggable";

import Collection from "@/components/Collection.vue";
import dappMixin from "@/mixins/dapp";


export default {
  mixins: [
    dappMixin,
  ],
  components: {
    collection: Collection,
    draggable
  },
  data() {
    let goods = [];
    for (let i = 0; i < 20; i++) {
      goods.push({
        id: i
      });
    }

    let friends = [];
    for (let i = 0; i < 3; i++) {
      friends.push({
        id: i
      });
    }

    return {
      goods,
      friends
    };
  },
  methods: {
    ready() {
    }
  }
};
</script>

<style lang="stylus" scoped>
.host

  width 100%
  min-height 100%
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
      flex 1 1 auto
      .item
        background-color #fff
        height 120px
        >*
          display flex
          flex-direction: column;
          justify-content: flex-start;

          >.icon
            background-color #f88
            width 60px
            height 60px
            border-radius 30px
            box-shadow 0 1px 2px alpha(#000,0.1)
          >label
            text-align center

    >.friends
      width 300px
      height 100%
      .item
        background-color #fff
        height 120px
        >*
          margin 8px
          // background-color alpha(#000,0.3)
          flex 1 1 auto

          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
          justify-content: flex-start;
          align-content: flex-start;
          align-items: flex-end;
          height calc(100% - 16px)

          >label
            text-align center
            height 20px
            display block
            width 100%
            margin-bottom 4px
            flex 1 1 auto

          >.goods
            background-color alpha(#fff,1)
            box-shadow inset 0 1px 2px rgba(#000, 0.1)
            width 100%
            height 20px
            border-radius 30px
            box-shadow 0 1px 2px alpha(#000,0.1)
            align-self: flex-end;

</style>
