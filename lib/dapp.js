import Web3 from "web3";

import * as config from "@/lib/config.yaml";


class Contract {
  constructor(web3Contract, web3EventContract) {
    // Deployment
    this.deploy = web3Contract.deploy.bind(web3Contract);

    // Todo hide options, methods and events
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
        },
      );
    }

    // Copy events
    this.events = web3EventContract.events;
    for (let eventName in this.events) {
      Object.defineProperty(
        this,
        eventName,
        {
          get: () => {
            return this.events[eventName];
          },
        },
      );
    }
    this.getPastEvents = web3EventContract.getPastEvents.bind(
      web3EventContract,
    );
  }

  get address() {
    return this.options.address;
  }
}

export default class Dapp {
  constructor() {
    this.web3Event = new Web3(
      new Web3.providers.WebsocketProvider(config.WEBSOCKET_NODE),
    );

    if (window.web3 && window.web3.currentProvider) {
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      throw new Error("No web3 provider found");
    }
  }

  async asyncInitialize() {
    const accounts = await this.web3.eth.getAccounts();

    if (!accounts) {
      throw new Error(`accounts is falsy ${accounts}`);
    }

    if (accounts.length === 0) {
      throw new Error(
        "No accounts found. Unlock your web3 wallet and reload this page.",
      );
    }

    console.log(`Found ${accounts.length} accounts`);

    this.defaultAccount = accounts[0];
    console.log("Setting default address", this.defaultAccount);
    this.web3.eth.defaultAccount = this.defaultAccount;

    this.networkID = await this.web3.eth.net.getId();
    if (!config.contracts[this.networkID.toString()]) {
      throw new Error(
        `Could not find network ID ${this.networkID} in configuration.`,
      );
    }
  }

  getContract(contract, address) {
    function _get(web3Instance) {
      const options = {
        from: web3Instance.eth.defaultAccount,
        gasPrice: web3Instance.utils.toWei(config.GAS_PRICE, "gwei"),
        data: contract.bytecode,
      };
      return new web3Instance.eth.Contract(contract.abi, address, options);
    }
    return new Contract(_get(this.web3), _get(this.web3Event));
  }

  getContractAddress(name) {
    const configuration = config.contracts[this.networkID.toString()];
    if (!configuration) {
      throw new Error(`Network ${this.networkID} not configured`);
    }
    const address = configuration[name];
    if (!address) {
      throw new Error(`Could not find contract address for ${name}`);
    }
    return address;
  }

  getContractAt(contract, addressName) {
    const address = this.getContractAddress(addressName || contract.name);
    return this.getContract(contract, address);
  }

  async deployContract(contract, args, web3Instance) {
    const promise = this.getContract(contract).deploy({ arguments: args });
    const gas = await promise.estimateGas();
    return (await promise.send({ gas })).options.address;
  }
}


export const dapp = new Dapp();
