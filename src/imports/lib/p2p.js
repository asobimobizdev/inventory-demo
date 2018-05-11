import signalhub from "signalhub";
import { addressStreamer } from "./../api/streams";

export default class P2PManager {
  constructor() { }

  subscribe(address, context) {
    addressStreamer.on(address, function (message) {
      switch (message.action) {
      case "addUnconfirmedTransaction":
        message.to = context.state.accountAddress;
        context.commit("addUnconfirmedTransaction", message);
        break;
      case "removeUnconfirmedTransaction":
        message.to = context.state.accountAddress;
        context.commit("removeUnconfirmedTransaction", message);
        break;
      }
    });
  }

  addUnconfirmedTransaction(from, toAddress, goodID) {
    addressStreamer.emit(toAddress, { action: "addUnconfirmedTransaction", from, goodID });
  }

  removeUnconfirmedTransaction(from, toAddress, goodID) {
    addressStreamer.emit(toAddress, { action: "removeUnconfirmedTransaction", from, goodID });
  }

}

export const p2pManager = new P2PManager();
