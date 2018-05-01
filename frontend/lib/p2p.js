import signalhub from "signalhub";

export default class P2PManager {
  constructor() {
    this.hub = new signalhub('asobi-inventory', [
      // "http://localhost:8080"
      "https://signalhub-jccqtwhdwc.now.sh"
    ]);
  }

  subscribe(address, context) {
    console.log("subscribe", address);
    this.hub.subscribe(address)
      .on('data', function (message) {
        console.log('new message received', message)
        message.to = context.state.accountAddress;
        context.commit("addUnconfirmedTransaction", message);
      })
  }

  dispatchTransaction(from, toAddress, goodID) {
    console.log("dispatchTransaction", from, toAddress, goodID)
    this.hub.broadcast(toAddress, { action: "goodTransaction", from, goodID });
  }

}

export const p2pManager = new P2PManager();
