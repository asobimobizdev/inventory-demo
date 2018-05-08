import { Rigs } from "../api/collections";
import { Meteor } from "meteor/meteor";

export function supplyMix(...list) {
  let $subscribe = {};
  let meteor = {};

  list.forEach(element => {

    $subscribe = {
      ...meteor.$subscribe,
      ...element.meteor.$subscribe,
    };

    meteor = {
      ...meteor,
      ...element.meteor,
    };

    meteor.$subscribe = $subscribe;

  });

  return meteor;
}

export const onLineRigs = {
  meteor: {
    $subscribe: {
      onLineRigs: [],
    },

    onLineRigs() {
      return Rigs.find({ shared: true });
    },
  },
};

export const myRigs = {
  meteor: {

    $subscribe: {
      myRigs: [],
    },

    myRigs() {
      let owner = Meteor.userId();
      if (!owner) return [];
      return Rigs.find({ owner });
    },

  },
};

export const rig = {
  meteor: {
    $subscribe: {
      rig() {
        return [this.id];
      },
    },
    rig() {
      return Rigs.findOne(this.id);
    },
  },
};
