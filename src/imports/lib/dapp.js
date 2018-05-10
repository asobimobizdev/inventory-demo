import Web3 from "web3";
import { Goods } from "../../../contracts/Goods.sol";
import { AsobiCoin } from "../../../contracts/AsobiCoin.sol";
import { Escrow } from "../../../contracts/Escrow.sol";


export default class Dapp {
  constructor() {
    if (typeof window.web3 !== "undefined") {
      this.web3 = new Web3(window.web3.currentProvider);
    }

    this.contracts = {
      Goods,
      AsobiCoin,
      Escrow,
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

  getContract(contract, address) {
    const options = {
      from: this.web3.eth.defaultAccount,
      gasPrice: this.web3.utils.toWei("10", "gwei"),
      data: contract.bytecode,
    };
    const instance = new this.web3.eth.Contract(
      contract.abi,
      address,
      options,
    );
    return instance;
  }

  getContractAt(contract, address) {
    const contractInstance = this.getContract(contract, address);
    return contractInstance;
  }

  async deployContract(contract, args) {
    const contractInstance = this.getContract(contract);
    const promise = contractInstance.deploy(
      {
        arguments: args,
      },
    );
    const gas = await promise.estimateGas();
    return await promise.send({ gas });
  }

  async getTokensForAddress(token, escrow, address) {
    const balance = await token.methods.balanceOf(address).call();
    const items = [];
    for (let i = 0; i < balance; i += 1) {
      const id = await token.methods.tokenOfOwnerByIndex(address, i).call();
      const approved = await token.methods.getApproved(id).call();
      const price = dapp.web3.utils.fromWei(
        await escrow.methods.getPrice(id).call(),
      )
      items.push(
        {
          id: id,
          confirmed: true,
          price: price,
          // XXX there has to be a more intelligent way of checking
          // for the null address Justus 2018-05-09
          forSale: approved !== "0x0000000000000000000000000000000000000000",
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
