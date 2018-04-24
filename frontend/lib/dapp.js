/* global web3 */
import Web3 from "web3";
import MintableERC721 from "../../backend/build/contracts/MintableERC721.json";

export default class Dapp {
  constructor() {
    if (typeof web3 !== "undefined") {
      this.web3 = new Web3(web3.currentProvider);
    }

    this.contracts = {
      MintableERC721,
    };
  }

  getContract(contract) {
    return new this.web3.eth.Contract(contract);
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
        args,
        data: contract.bytecode,
      }
    );
  }
}
