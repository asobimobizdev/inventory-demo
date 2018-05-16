import { dapp } from "./dapp.js";


class Repository {
  constructor(dapp) {
    this.dapp = dapp;
    this.web3 = dapp.web3;
  }

  async getGoodsForAddress(address, goods, escrow) {
    const balance = await this.getGoodsBalance(address, goods);
    const items = [];
    for (let i = 0; i < balance; i += 1) {
      const id = await goods.methods.tokenOfOwnerByIndex(address, i).call();
      // check whether good can be spent by looking at approval
      const approved = await escrow.methods.isListed(id).call();
      const price = this.web3.utils.fromWei(
        await escrow.methods.getPrice(id).call(),
      );
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

  async transferGood(goodID, from, to, good) {
    await good.methods.transferFrom(
      from,
      to,
      goodID,
    ).send();
  }

  async setGoodForSale(goodID, price, forSale, good, escrow) {
    const approved = await good.methods.getApproved(
      goodID,
    ).call() === escrow.options.address;
    if (!forSale) {
      if (approved) {
        console.log("Removing approval");
        await good.methods.approve(
          "0x0",
          goodID,
        ).send();
      }
      return;
    }
    if (!approved) {
      console.log("Escrow contract not yet approved", approved);
      await good.methods.approve(
        escrow.options.address,
        goodID,
      ).send();
    } else {
      console.log("Escrow contract already approved");
    }
    await escrow.methods.setPrice(
      goodID,
      this.dapp.web3.utils.toWei(price, "ether"), // TODO Justus 2018-05-09
    ).send();
  }

  async buyGood(goodID, buyer, good, coin, escrow) {
    // Check whether we have already approved spending
    const price = this.dapp.web3.utils.toBN(
      await escrow.methods.getPrice(goodID).call()
    );

    const allowance = this.dapp.web3.utils.toBN(
      await coin.methods.allowance(buyer, escrow.options.address).call()
    );

    // Approve spending
    if (allowance.lt(price)) {
      await coin.methods.approve(
        escrow.options.address,
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
    await escrow.methods.swap(goodID).send;
  }

  async isAdmin(address, contract) {
    const result = await contract.methods.owner().call();
    return result === address;
  }

  async isAsobiCoinAdmin(address, coin) {
    return await this.isAdmin(address, coin);
  }

  async isGoodsAdmin(address, goods) {
    return await this.isAdmin(address, goods);
  }

  async getBalance(address, contract) {
    return await contract.methods.balanceOf(address).call();
  }

  async getGoodsBalance(address, goods) {
    return await this.getBalance(address, goods);
  }

  async getAsobiCoinBalance(address, coin) {
    return await this.getBalance(address, coin);
  }

  async mint(receiver, value, contract) {
    return await contract.methods.mint(receiver, value).send();
  }

  async createGood(receiver, good) {
    await this.mint(receiver, this.generateGoodID(), good);
  }

  async createCoin(receiver, amount, coin) {
    await coin.methods.mint(
      receiver,
      amount,
    ).send();
  }

  generateGoodID() {
    return this.web3.utils.randomHex(32);
  }
}

export default new Repository(dapp);
