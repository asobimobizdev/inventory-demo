import Web3 from "web3";
import { Goods } from "../../../contracts/Goods.sol";
import { AsobiCoin } from "../../../contracts/AsobiCoin.sol";
import { Escrow } from "../../../contracts/Escrow.sol";

// const WEBSOCKET_NODE = "wss://geth-light.herokuapp.com/";
const WEBSOCKET_NODE = "wss://rinkeby.infura.io/ws";
// const WEBSOCKET_NODE = "ws://localhost:8546/";

export default class Dapp {
  constructor() {
    if (typeof window.web3 !== "undefined") {
      this.web3 = new Web3(window.web3.currentProvider);
      this.web3Event = new Web3(
        new Web3.providers.WebsocketProvider(WEBSOCKET_NODE)
      );
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

  getContract(contract, address, web3Instance) {
    web3Instance = web3Instance || this.web3;
    const options = {
      from: web3Instance.eth.defaultAccount,
      gasPrice: web3Instance.utils.toWei("10", "gwei"),
      data: contract.bytecode,
    };
    const instance = new web3Instance.eth.Contract(
      contract.abi,
      address,
      options,
    );
    return instance;
  }

  getContractAt(contract, address, web3Instance) {
    const contractInstance = this.getContract(contract, address, web3Instance);
    return contractInstance;
  }

  async deployContract(contract, args, web3Instance) {
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
      const approved = await escrow.methods.getPrice(
        id
      ) > 0;
      const price = approved ? dapp.web3.utils.fromWei(
        await escrow.methods.getPrice(id).call(),
      ) : null;
      items.push(
        {
          id: id,
          confirmed: true,
          price: price,
          forSale: approved,
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
