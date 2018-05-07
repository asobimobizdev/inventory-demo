import { Meteor } from "meteor/meteor";

Meteor.publish("userData", _ => {

  if (Meteor.userId()) {
    return Meteor.users.find({ _id: Meteor.userId() }, {
      fields: { rigs: 1 },
    });
  }

});
