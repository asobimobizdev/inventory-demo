import signalhub from "signalhub";

export default class P2PManager {
  constructor() {
    this.hub = new signalhub('asobi-inventory', [
      "http://localhost:8080"
    ]);
  }

  connectTo(address) {

  }

}

export const p2pManager = new P2PManager();
