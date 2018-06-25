import { dapp } from "@/lib/dapp.js";
import web3Utils from "web3-utils";

import { AsobiCoin } from "@/contracts/AsobiCoin.sol";
import { Escrow } from "@/contracts/Escrow.sol";
import { Goods } from "@/contracts/Goods.sol";
import { Trade } from "@/contracts/Trade.sol";
import { TradeRegistry } from "@/contracts/TradeRegistry.sol";
import { UserRegistry } from "@/contracts/UserRegistry.sol";
import BaseRepository from "@/repository/base";

const range = n => Array.from({ length: n }, (value, key) => key);


export default class Repository extends BaseRepository {
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
    this.asobiCoin = this.dapp.getContractAt(AsobiCoin);
  }

  async createCoin(receiver, amount) {
    await this.asobiCoin.mint(receiver, amount).send();
  }

  async isAsobiCoinAdmin(address) {
    return await this.isAdmin(address, this.asobiCoin);
  }

  async getAsobiCoinBalance(address) {
    return await this.getBalance(address, this.asobiCoin);
  }

  async getPastAsobiCoinTransfers() {
    return (
      await this.asobiCoin.getPastEvents("Transfer", { fromBlock: 0 })
    ).map(this._convertAsobiCoinTransferEvent);
  }

  asobiCoinTransferEvents(cb) {
    return this.asobiCoin.Transfer()
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
    this.goods = this.dapp.getContractAt(Goods);
  }

  async createGood(receiver) {
    await this.mint(receiver, this.generateGoodID(), this.goods);
  }

  async getGoodsBalance(address) {
    return await this.getBalance(address, this.goods);
  }

  async isGoodsAdmin(address) {
    return await this.isAdmin(address, this.goods);
  }

  generateGoodID() {
    return web3Utils.randomHex(32);
  }

  async getGoodsForAddress(address) {
    const getGood = async (index) => {
      const id = await this.goods.tokenOfOwnerByIndex(
        address,
        index,
      ).call();
      const price = await this.escrow.priceOf(id).call();
      return {
        id: id,
        confirmed: true,
        price: web3Utils.fromWei(price),
      };
    };
    const balance = await this.getGoodsBalance(address, this.goods);
    const indices = range(balance);
    const items = await Promise.all(indices.map(getGood));
    return items;
  }

  async transferGood(from, to, goodID) {
    await this.goods.safeTransferFrom(
      from,
      to,
      goodID,
    ).send();
  }

  async setGoodForSale(goodID, price, forSale) {
    const priceWei = web3Utils.toWei(price, "ether");
    const priceHex = web3Utils.padLeft(web3Utils.toHex(priceWei), 64);
    await this.goods.safeTransferFrom(
      this.defaultAccount,
      this.escrow.address,
      goodID,
      priceHex,
    ).send();
  }

  // Escrow
  async createEscrowContract(coin, goods) {
    return await dapp.deployContract(Escrow, [coin.address, goods.address]);
  }

  loadEscrowContract() {
    this.escrow = this.dapp.getContractAt(Escrow);
  }

  async buyGood(goodID, buyer) {
    // Check whether we have already approved spending
    const price = web3Utils.toBN(
      await this.escrow.getPrice(goodID).call(),
    );

    const allowance = web3Utils.toBN(
      await this.asobiCoin.allowance(
        buyer,
        this.escrow.options.address,
      ).call(),
    );

    // Approve spending
    if (allowance.lt(price)) {
      await this.asobiCoin.approve(
        this.escrow.options.address,
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
    await this.escrow.swap(goodID).send();
  }

  // User Registry
  async createUserRegistry() {
    return await dapp.deployContract(UserRegistry, []);
  }

  loadUserRegistryContract() {
    this.userRegistry = this.dapp.getContractAt(UserRegistry);
  }

  async getRegisterState(address) {
    const registered = await this.userRegistry.isUser(
      address,
    ).call();
    let name = null;
    if (registered) {
      name = await this.userRegistry.userName(
        address,
      ).call();
    }
    return { registered, name };
  }

  async registerUser(name) {
    await this.userRegistry.add(name).send();
  }

  async unregisterUser(name) {
    await this.userRegistry.remove().send();
  }

  async getFriends() {
    const getFriend = async (index) => {
      const address = await this.userRegistry.users(
        index,
      ).call();
      return {
        id: address,
        name: await this.userRegistry.userName(
          address,
        ).call(),
      };
    };
    const indices = range(
      await this.userRegistry.numUsers().call(),
    );
    return await Promise.all(indices.map(getFriend));
  }

  // Trade Registry
  async createTradeRegistry() {
    return await dapp.deployContract(TradeRegistry, []);
  }

  loadTradeRegistryContract() {
    this.tradeRegistry = this.dapp.getContractAt(TradeRegistry);
  }

  async closeTrade() {
    console.log("Removing trade from registry");
    await this.tradeRegistry.remove().send();
  }

  // Trade
  async createTrade(userA, userB) {
    const trade = await this.dapp.deployContract(
      Trade,
      [
        this.goods.options.address,
        [
          userA,
          userB,
        ],
      ],
    );
    await this.tradeRegistry.add(
      trade.options.address,
    ).send();
  }

  async loadTrade(accountAddress) {
    const tradeAddress = await this.tradeRegistry.traderTrade(
      accountAddress,
    ).call();
    if (tradeAddress == "0x0000000000000000000000000000000000000000") {
      return null;
    }
    this.trade = this.dapp.getContractAt(Trade);

    const [userA, userB] = await Promise.all([
      this.trade.traders(0).call(),
      this.trade.traders(1).call(),
    ]);
    const otherUserID = userA == accountAddress ? userB : userA;
    const [accepted, otherAccepted] = await Promise.all([
      this.trade.traderAccepted(accountAddress).call(),
      this.trade.traderAccepted(otherUserID).call(),
    ]);
    const pulled = await this.trade.traderPulledGoods(
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
    const isActive = await this.trade.isActive().call();
    if (isActive) {
      console.log("Trade is still active");
      await this.trade.cancel().send();
    } else {
      console.log("Trade is not active, skipping cancelling");
    }
  }

  async confirmTrade() {
    console.log("Accepting trade");
    await this.trade.accept().send();
  }

  async removeGoodFromTrade(goodID) {
    await this.trade.removeGood(goodID).send();
  }

  async getTradeGoods() {
    const getGoodOwner = async (good) => {
      const trader = await this.trade.goodsTrader(
        good.id,
      ).call();
      return {
        ...good,
        trader,
      };
    };
    const goodsRaw = await this.getGoodsForAddress(
      this.trade.options.address,
    );
    return Promise.all(goodsRaw.map(getGoodOwner));
  }

  async pullGoods() {
    await this.trade.getGoods().send();
  }

  async transferToTrade(accountAddress, goodID) {
    await this.transferGood(
      accountAddress,
      this.trade.options.address,
      goodID,
    );
  }

  // Events
  tradeRegistryEvents() {
    return this.tradeRegistry.allEvents();
  }

  goodsTransferEvents() {
    return this.goods.Transfer();
  }

  escrowListedEvents() {
    return this.escrow.Listed();
  }

  userRegistryEvents() {
    return this.userRegistry.allEvents();
  }

  tradeEvents() {
    return this.trade.allEvents();
  }
}
