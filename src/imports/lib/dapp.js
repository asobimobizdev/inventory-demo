import Web3 from "web3";

const WEBSOCKET_NODE = "wss://rinkeby.infura.io/ws";
const GAS_PRICE = "10"; // gwei

class Contract {
  constructor(web3Contract, web3EventContract) {
    // Copy options
    this.options = web3Contract.options;

    // Copy methods
    this.methods = web3Contract.methods;
    for (let methodName in this.methods) {
      Object.defineProperty(
        this,
        methodName,
        {
          get: () => {
            return this.methods[methodName];
          },
        }
      );
    }

    // Copy events
    this.events = web3Contract.events;
    for (let eventName in this.events) {
      Object.defineProperty(
        this,
        eventName,
        {
          get: () => {
            return this.events[eventName];
          },
        }
      );
    }
  }

  get address() {
    return this.options.address;
  }
}

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
    return new Contract(_get(this.web3), _get(this.web3Event));
  }

  getContractAt(contract, address) {
    return this.getContract(contract, address);
  }

  async deployContract(contract, args, web3Instance) {
    const [contractInstance, _] = this.getContract(contract);
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
