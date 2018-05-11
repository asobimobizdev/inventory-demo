import { Meteor } from "meteor/meteor";
import { Wallets } from "./collections";

Meteor.publish("userData", _ => {

  if (Meteor.userId()) {
    return Meteor.users.find({ _id: Meteor.userId() }, {
      fields: { rigs: 1 },
    });
  }

});

Meteor.publish("friendsWallets", myAddress => {
  return Wallets.find();
});
