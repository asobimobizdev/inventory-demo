import signalhub from "signalhub";
import { addressStreamer } from "./../api/streams";

export default class P2PManager {
  constructor() { }

  subscribe(address, context) {
    addressStreamer.on(address, function (message) {
      message.to = context.state.accountAddress;
      context.commit("addUnconfirmedTransaction", message);
    });
  }

  dispatchTransaction(from, toAddress, goodID) {
    addressStreamer.emit(toAddress, { action: "goodTransaction", from, goodID });
  }

}

export const p2pManager = new P2PManager();
