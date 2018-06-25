export default class BaseRepository {
  constructor(dapp) {
    this.dapp = dapp;
    this.web3 = dapp.web3;
    this.c = {};
  }

  get defaultAccount() {
    return this.dapp.defaultAccount;
  }

  get networkIdentifier() {
    return this.dapp.networkID;
  }

  async initialize() {
    throw new Error("Not Implemented");
  }

  loadContracts() {
    throw new Error("Not Implemented");
  }
}
