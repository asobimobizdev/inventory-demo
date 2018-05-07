import "./imports/api/methods";
import collections from "./imports/api/collections";
import "./imports/api/streams";

if (Meteor.isClient) {
  import "./imports/client";

  window.collections = collections;

} else if (Meteor.isServer) {
  import "./imports/server";
}
