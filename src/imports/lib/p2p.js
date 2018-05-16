import { addressStreamer } from "./../api/streams";

export default class P2PManager {
  constructor() { }

  subscribe(address, context) {
    addressStreamer.on(address, function (message) {
      switch (message.action) {
      case "addUnconfirmedTransaction":
        message.to = address;
        context.commit("addUnconfirmedTransaction", message);
        break;
      case "removeUnconfirmedTransaction":
        message.to = address;
        context.commit("removeUnconfirmedTransaction", message);
        break;
      }
    });
  }

  addUnconfirmedTransaction(from, toAddress, goodID) {
    addressStreamer.emit(toAddress, { action: "addUnconfirmedTransaction", from, goodID });
  }

  removeUnconfirmedTransaction(from, toAddress, goodID, confirmed=false) {
    addressStreamer.emit(toAddress, { action: "removeUnconfirmedTransaction", from, goodID, confirmed });
  }


}

export const p2pManager = new P2PManager();
