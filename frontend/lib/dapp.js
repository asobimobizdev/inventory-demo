import Web3 from "web3";
import MintableERC721 from "../../backend/build/contracts/MintableERC721.json";


export default class Dapp {
  constructor() {
    if (typeof window.web3 !== "undefined") {
      this.web3 = new Web3(window.web3.currentProvider);
    }

    this.contracts = {
      MintableERC721,
    };
  }

  initialize(callback) {
    this.asyncInitialize().then(callback);
  }

  async asyncInitialize() {
    const accounts = await this.web3.eth.getAccounts();
    if (accounts.length === 0) {
      window.alert("Unlock your web3 wallet and reload this page");
    }
    this.defaultAccount = accounts[0];
    this.web3.eth.defaultAccount = this.defaultAccount;
  }

  getContract(contract) {
    const options = {
      from: this.web3.eth.defaultAccount,
    };
    const result = new this.web3.eth.Contract(
      contract.abi,
      null,
      options,
    );
    return result;
  }

  getContractAt(contract, address) {
    const contractInstance = this.getContract(contract);
    contractInstance.options.address = address;
    return contractInstance;
  }

  deployContract(contract, args) {
    console.log(contract);
    const contractInstance = this.getContract(contract);
    return contractInstance.deploy(
      {
        arguments: args,
        data: contract.bytecode,
      }
    ).send();
  }
}

export const dapp = new Dapp();
