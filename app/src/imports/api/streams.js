
import { Meteor } from "meteor/meteor";

export const addressStreamer = new Meteor.Streamer("rigsStream");

if (Meteor.isServer) {
  addressStreamer.allowRead("all");
  addressStreamer.allowWrite("all");
}

if (Meteor.isClient) {
  window.addressStreamer = addressStreamer;
}
