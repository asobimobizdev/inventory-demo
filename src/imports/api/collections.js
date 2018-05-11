import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const Wallets = new Mongo.Collection("wallets");


Wallets.allow({
  insert(userId, doc) {
    // The user must be logged in and the document must be owned by the user.
    // return userId && doc.owner === userId;
    return true;
  },

  update(userId, doc, fields, modifier) {
    // Can only change your own documents.
    // return doc.owner === userId;
    return true;
  },

  remove(userId, doc) {
    // Can only remove your own documents.
    // return doc.owner === userId;
    return true;
  },

  // fetch: ['all']
});

if (Meteor.isServer) {

  // Rigs.rawCollection().createIndex({
  //   owner: 1,
  // })

  // Rigs.rawCollection().createIndex({
  //   online: 1,
  // })

}
