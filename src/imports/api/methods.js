import { check } from "meteor/check";
import { Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { throws } from "assert";
import { connect } from "tls";

Meteor.methods({
  // ['rigs:share'](rigId, shared = true) {
  //   check(rigId, Match.Any)
  //   check(shared, Boolean);

  //   const rig = Rigs.findOne(rigId);
  //   let userId = Meteor.userId()

  //   if (!userId) {
  //     throw new Meteor.Error(511, "Authentication Required");
  //   }

  //   if (!rig) {
  //     throw new Meteor.Error(505, "Rig not found");
  //   }

  //   if (rig.owner != userId) {
  //     throw new Meteor.Error(511, "You not own this rig");
  //   }

  //   Rigs.update(rigId, { $set: { shared } })
  // },

  // ['rigs:sendSignal'](rigId, signal) {
  //   check(rigId, Match.Any)

  //   const rig = Rigs.findOne(rigId);
  //   let userId = Meteor.userId()

  //   if (!userId) {
  //     throw new Meteor.Error(511, "Authentication Required");
  //   }

  //   if (!rig) {
  //     throw new Meteor.Error(505, "Rig not found");
  //   }

  //   const $set = {
  //     connection: {
  //       ...rig.connection,
  //       signal,
  //       signalFrom: userId,
  //       startTime: Date.now()
  //     }
  //   }

  //   if (userId != rig.owner) {
  //     $set.connection.userId = userId
  //   }

  //   Rigs.update(rigId, { $set })

  // },

  // ['rigs:connected'](rigId, connected) {

  //   const rig = Rigs.findOne(rigId);
  //   let userId = Meteor.userId()

  //   if (!userId) {
  //     throw new Meteor.Error(511, "Authentication Required");
  //   }

  //   if (!rig) {
  //     throw new Meteor.Error(505, "Rig not found");
  //   }

  //   const $set = {
  //     connection: {
  //       connected,
  //       userId: rig.connection.userId,
  //       startTime: Date.now()
  //     }
  //   }

  //   Rigs.update(rigId, { $set })
  // }

});
