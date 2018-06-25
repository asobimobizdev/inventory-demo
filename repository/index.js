import { dapp } from "@/lib/dapp.js";
import web3Utils from "web3-utils";

import { AsobiCoin } from "@/contracts/AsobiCoin.sol";
import { Escrow } from "@/contracts/Escrow.sol";
import { Goods } from "@/contracts/Goods.sol";
import { Trade } from "@/contracts/Trade.sol";
import { TradeRegistry } from "@/contracts/TradeRegistry.sol";
import { UserRegistry } from "@/contracts/UserRegistry.sol";

const range = n => Array.from({ length: n }, (value, key) => key);


export default class Repository {
  constructor(dapp) {
    this.dapp = dapp;
    this.web3 = dapp.web3;
    this.c = {};
  }

  // General
  async isAdmin(address, contract) {
    return (await contract.owner().call()) === address;
  }

  async getBalance(address, contract) {
    return await contract.balanceOf(address).call();
  }

  async mint(receiver, value, contract) {
    return await contract.mint(receiver, value).send();
  }

  // AsobiCoin
  async createAsobiCoinContract() {
    return await dapp.deployContract(AsobiCoin, []);
  }

  loadAsobiCoinContract() {
    this.c.asobiCoin = this.dapp.getContractAt(AsobiCoin);
  }

  async createCoin(receiver, amount) {
    await this.c.asobiCoin.mint(receiver, amount).send();
  }

  async isAsobiCoinAdmin(address) {
    return await this.isAdmin(address, this.c.asobiCoin);
  }

  async getAsobiCoinBalance(address) {
    return await this.getBalance(address, this.c.asobiCoin);
  }

  async getPastAsobiCoinTransfers() {
    return (
      await this.c.asobiCoin.getPastEvents("Transfer", { fromBlock: 0 })
    ).map(this._convertAsobiCoinTransferEvent);
  }

  asobiCoinTransferEvents(cb) {
    return this.c.asobiCoin.Transfer()
      .on("data", (event) => {
        cb(this._convertAsobiCoinTransferEvent(event));
      })
      .on("error", console.log);
  }

  _convertAsobiCoinTransferEvent({ transactionHash, blockNumber, returnValues }) {
    return {
      transactionHash,
      blockNumber,
      from: returnValues.from,
      to: returnValues.to,
      value: returnValues.value,
    };
  }

  // Goods
  async createGoodsContract() {
    return await dapp.deployContract(Goods, []);
  }

  loadGoodsContract() {
    this.c.goods = this.dapp.getContractAt(Goods);
  }

  async createGood(receiver) {
    await this.mint(receiver, this.generateGoodID(), this.c.goods);
  }

  async getGoodsBalance(address) {
    return await this.getBalance(address, this.c.goods);
  }

  async isGoodsAdmin(address) {
    return await this.isAdmin(address, this.c.goods);
  }

  generateGoodID() {
    return web3Utils.randomHex(32);
  }

  async getGoodsForAddress(address) {
    const getGood = async (index) => {
      const id = await this.c.goods.tokenOfOwnerByIndex(
        address,
        index,
      ).call();
      const price = await this.c.escrow.priceOf(id).call();
      return {
        id: id,
        confirmed: true,
        price: web3Utils.fromWei(price),
      };
    };
    const balance = await this.getGoodsBalance(address, this.c.goods);
    const indices = range(balance);
    const items = await Promise.all(indices.map(getGood));
    return items;
  }

  async transferGood(from, to, goodID) {
    await this.c.goods.safeTransferFrom(
      from,
      to,
      goodID,
    ).send();
  }

  async setGoodForSale(goodID, price, forSale) {
    const approved = await this.c.goods.getApproved(
      goodID,
    ).call() === this.c.escrow.options.address;
    if (!forSale) {
      if (approved) {
        console.log("Removing approval");
        await this.c.goods.approve("0x0", goodID).send();
      }
      return;
    }
    if (!approved) {
      console.log("Escrow contract not yet approved", approved);
      await this.c.goods.approve(
        this.c.escrow.options.address,
        goodID,
      ).send();
    } else {
      console.log("Escrow contract already approved");
    }
    await this.c.escrow.setPrice(
      goodID,
      web3Utils.toWei(price, "ether"),
    ).send();
  }

  // Escrow
  async createEscrowContract(coin, goods) {
    return await dapp.deployContract(Escrow, [coin.address, goods.address]);
  }

  loadEscrowContract() {
    this.c.escrow = this.dapp.getContractAt(Escrow);
  }

  async buyGood(goodID, buyer) {
    // Check whether we have already approved spending
    const price = web3Utils.toBN(
      await this.c.escrow.getPrice(goodID).call(),
    );

    const allowance = web3Utils.toBN(
      await this.c.asobiCoin.allowance(
        buyer,
        this.c.escrow.options.address,
      ).call(),
    );

    // Approve spending
    if (allowance.lt(price)) {
      await this.c.asobiCoin.approve(
        this.c.escrow.options.address,
        web3Utils.toWei(price, "ether"),
      ).send();
    } else {
      console.log(
        "Allowance",
        allowance.toString(),
        "sufficient for price",
        price.toString(),
      );
    }
    await this.c.escrow.swap(goodID).send();
  }

  // User Registry
  async createUserRegistry() {
    return await dapp.deployContract(UserRegistry, []);
  }

  loadUserRegistryContract() {
    this.c.userRegistry = this.dapp.getContractAt(UserRegistry);
  }

  async getRegisterState(address) {
    const registered = await this.c.userRegistry.isUser(
      address,
    ).call();
    let name = null;
    if (registered) {
      name = await this.c.userRegistry.userName(
        address,
      ).call();
    }
    return { registered, name };
  }

  async registerUser(name) {
    await this.c.userRegistry.add(name).send();
  }

  async unregisterUser(name) {
    await this.c.userRegistry.remove().send();
  }

  async getFriends() {
    const getFriend = async (index) => {
      const address = await this.c.userRegistry.users(
        index,
      ).call();
      return {
        id: address,
        name: await this.c.userRegistry.userName(
          address,
        ).call(),
      };
    };
    const indices = range(
      await this.c.userRegistry.numUsers().call(),
    );
    return await Promise.all(indices.map(getFriend));
  }

  // Trade Registry
  async createTradeRegistry() {
    return await dapp.deployContract(TradeRegistry, []);
  }

  loadTradeRegistryContract() {
    this.c.tradeRegistry = this.dapp.getContractAt(TradeRegistry);
  }

  async closeTrade() {
    console.log("Removing trade from registry");
    await this.c.tradeRegistry.remove().send();
  }

  // Trade
  async createTrade(userA, userB) {
    const trade = await this.dapp.deployContract(
      Trade,
      [
        this.c.goods.options.address,
        [
          userA,
          userB,
        ],
      ],
    );
    await this.c.tradeRegistry.add(
      trade.options.address,
    ).send();
  }

  async loadTrade(accountAddress) {
    const tradeAddress = await this.c.tradeRegistry.traderTrade(
      accountAddress,
    ).call();
    if (tradeAddress == "0x0000000000000000000000000000000000000000") {
      return null;
    }
    this.c.trade = this.dapp.getContractAt(Trade);

    const [userA, userB] = await Promise.all([
      this.c.trade.traders(0).call(),
      this.c.trade.traders(1).call(),
    ]);
    const otherUserID = userA == accountAddress ? userB : userA;
    const [accepted, otherAccepted] = await Promise.all([
      this.c.trade.traderAccepted(accountAddress).call(),
      this.c.trade.traderAccepted(otherUserID).call(),
    ]);
    const pulled = await this.c.trade.traderPulledGoods(
      accountAddress,
    ).call();
    return {
      id: tradeAddress,
      otherUserID,
      pulled,
      accepted,
      otherAccepted,
    };
  }

  async cancelTrade() {
    const isActive = await this.c.trade.isActive().call();
    if (isActive) {
      console.log("Trade is still active");
      await this.c.trade.cancel().send();
    } else {
      console.log("Trade is not active, skipping cancelling");
    }
  }

  async confirmTrade() {
    console.log("Accepting trade");
    await this.c.trade.accept().send();
  }

  async removeGoodFromTrade(goodID) {
    await this.c.trade.removeGood(goodID).send();
  }

  async getTradeGoods() {
    const getGoodOwner = async (good) => {
      const trader = await this.c.trade.goodsTrader(
        good.id,
      ).call();
      return {
        ...good,
        trader,
      };
    };
    const goodsRaw = await this.getGoodsForAddress(
      this.c.trade.options.address,
    );
    return Promise.all(goodsRaw.map(getGoodOwner));
  }

  async pullGoods() {
    await this.c.trade.getGoods().send();
  }

  async transferToTrade(accountAddress, goodID) {
    await this.transferGood(
      accountAddress,
      this.c.trade.options.address,
      goodID,
    );
  }

  // Events
  tradeRegistryEvents() {
    return this.c.tradeRegistry.allEvents();
  }

  goodsTransferEvents() {
    return this.c.goods.Transfer();
  }

  escrowListedEvents() {
    return this.c.escrow.Listed();
  }

  userRegistryEvents() {
    return this.c.userRegistry.allEvents();
  }

  tradeEvents() {
    return this.c.trade.allEvents();
  }
}
