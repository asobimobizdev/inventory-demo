import { dapp } from "./dapp.js";


export default class Repository {
  constructor(dapp) {
    this.dapp = dapp;
    this.web3 = dapp.web3;
    this.c = {};
  }

  async getGoodsForAddress(address) {
    const getGood = async (index) => {
      const id = await this.c.goodsContract.methods.tokenOfOwnerByIndex(
        address,
        index,
      ).call();
      const [forSale, price] = await Promise.all([
        this.c.escrowContract.methods.isListed(id).call(),
        this.c.escrowContract.methods.getPrice(id).call(),
      ]);
      return {
        id: id,
        confirmed: true,
        price: this.web3.utils.fromWei(price),
        forSale: forSale,
      };
    }
    const balance = await this.getGoodsBalance(address, this.c.goodsContract);
    const indices = Array.from({length: balance}, (value, key) => key);
    const items = await Promise.all(indices.map(getGood));
    return items;
  }

  async transferGood(goodID, from, to) {
    await this.c.goodsContract.methods.transferFrom(from, to, goodID).send();
  }

  async setGoodForSale(goodID, price, forSale) {
    const approved = await this.c.goodsContract.methods.getApproved(
      goodID,
    ).call() === this.c.escrowContract.options.address;
    if (!forSale) {
      if (approved) {
        console.log("Removing approval");
        await this.c.goodsContract.methods.approve("0x0", goodID).send();
      }
      return;
    }
    if (!approved) {
      console.log("Escrow contract not yet approved", approved);
      await this.c.goodsContract.methods.approve(
        this.c.escrowContract.options.address,
        goodID,
      ).send();
    } else {
      console.log("Escrow contract already approved");
    }
    await this.c.escrowContract.methods.setPrice(
      goodID,
      this.dapp.web3.utils.toWei(price, "ether"), // TODO Justus 2018-05-09
    ).send();
  }

  async buyGood(goodID, buyer) {
    // Check whether we have already approved spending
    const price = this.dapp.web3.utils.toBN(
      await this.c.escrowContract.methods.getPrice(goodID).call()
    );

    const allowance = this.dapp.web3.utils.toBN(
      await this.c.asobiCoinContract.methods.allowance(
        buyer,
        this.c.escrowContract.options.address,
      ).call()
    );

    // Approve spending
    if (allowance.lt(price)) {
      await this.c.asobiCoinContract.methods.approve(
        this.c.escrowContract.options.address,
        this.dapp.web3.utils.toWei(price, "ether"), // TODO Justus 2018-05-09
      ).send();
    } else {
      console.log(
        "Allowance",
        allowance.toString(),
        "sufficient for price",
        price.toString(),
      );
    }
    await this.c.escrowContract.methods.swap(goodID).send();
  }

  async isAdmin(address, contract) {
    return (await contract.methods.owner().call()) === address;
  }

  async isAsobiCoinAdmin(address) {
    return await this.isAdmin(address, this.c.asobiCoinContract);
  }

  async isGoodsAdmin(address) {
    return await this.isAdmin(address, this.c.goodsContract);
  }

  async getBalance(address, contract) {
    return await contract.methods.balanceOf(address).call();
  }

  async getGoodsBalance(address) {
    return await this.getBalance(address, this.c.goodsContract);
  }

  async getAsobiCoinBalance(address) {
    return await this.getBalance(address, this.c.asobiCoinContract);
  }

  async mint(receiver, value, contract) {
    return await contract.methods.mint(receiver, value).send();
  }

  async createGood(receiver) {
    await this.mint(receiver, this.generateGoodID(), this.c.goodsContract);
  }

  async createCoin(receiver, amount) {
    await this.asobiCoinContract.methods.mint(receiver, amount).send();
  }

  generateGoodID() {
    return this.web3.utils.randomHex(32);
  }
}