import { dapp } from "./dapp.js";


class Repository {
  constructor(dapp) {
    this.dapp = dapp;
    this.web3 = dapp.web3;
  }

  async getGoodsForAddress(address, goods, escrow) {
    const balance = await goods.methods.balanceOf(address).call();
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

  generateGoodID() {
    return this.web3.utils.randomHex(32);
  }
}

export default new Repository(dapp);
