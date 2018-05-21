import Web3 from "web3";

const WEBSOCKET_NODE = "wss://rinkeby.infura.io/ws";
const GAS_PRICE = "10"; // gwei

export default class Dapp {
  constructor() {
    if (typeof window.web3 !== "undefined") {
      this.web3 = new Web3(window.web3.currentProvider);
      this.web3Event = new Web3(
        new Web3.providers.WebsocketProvider(WEBSOCKET_NODE)
      );
    }
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
    function _get(web3Instance) {
      const options = {
        from: web3Instance.eth.defaultAccount,
        gasPrice: web3Instance.utils.toWei(GAS_PRICE, "gwei"),
        data: contract.bytecode,
      };
      return new web3Instance.eth.Contract(contract.abi, address, options);
    }
    return [_get(this.web3), _get(this.web3Event)];
  }

  getContractAt(contract, address, web3Instance) {
    return this.getContract(contract, address, web3Instance);
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
}

export const dapp = new Dapp();
