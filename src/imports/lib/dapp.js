import Web3 from "web3";
import MintableERC721 from '../../../contracts/MintableERC721.sol';
console.log(MintableERC721);


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
      gasPrice: this.web3.utils.toWei("10", "gwei"),
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
    const contractInstance = this.getContract(contract);
    return contractInstance.deploy(
      {
        arguments: args,
        data: contract.bytecode,
      }
    ).send();
  }

  async getTokensForAddress(token, address) {
    const balance = await token.methods.balanceOf(address).call();
    const items = [];
    for (let i = 0; i < balance; i += 1) {
      items.push(
        {
          id: await token.methods.tokenOfOwnerByIndex(address, i).call(),
          confirmed: true,
        }
      );
    }
    return items;
  }

  generateTokenID() {
    return this.web3.utils.randomHex(32);
  }
}

export const dapp = new Dapp();
