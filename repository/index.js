import { dapp } from "@/lib/dapp.js";
import web3Utils from "web3-utils";

import { AsobiCoin } from "@/contracts/AsobiCoin.sol";
import { Escrow } from "@/contracts/Escrow.sol";
import { Goods } from "@/contracts/Goods.sol";
import { Shop } from "@/contracts/Shop.sol";
import { Trade } from "@/contracts/Trade.sol";
import { TradeRegistry } from "@/contracts/TradeRegistry.sol";
import { UserRegistry } from "@/contracts/UserRegistry.sol";
import BaseRepository from "@/repository/base";

const range = n => Array.from({ length: n }, (value, key) => key);


export default class Repository extends BaseRepository {
  // General
  async getBalance(address, contract) {
    return await contract.balanceOf(address).call();
  }

  // Shop
  async createShopContract(asobiCoin, goods) {
    return await dapp.deployContract(Shop, [asobiCoin, goods]);
  }

  loadShopContract() {
    this.shop = this.dapp.getContractAt(Shop);
  }

  async transferOwnershipsToShop(asobiCoin, goods, shop) {
    const coinContract = this.dapp.getContract(AsobiCoin, asobiCoin);
    const goodsContract = this.dapp.getContract(Goods, goods);
    // const shopContract = repostiory.dapp.getContract(Shop, shop);

    await Promise.all([
      coinContract.transferOwnership(shop).send(),
      goodsContract.transferOwnership(shop).send(),
    ]);
  }

  async buyAsobiCoinAndGoods() {
    await this.shop.buy().send();
  }

  // AsobiCoin
  async createAsobiCoinContract() {
    return await dapp.deployContract(AsobiCoin, []);
  }

  loadAsobiCoinContract() {
    this.asobiCoin = this.dapp.getContractAt(AsobiCoin);
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

  async getGoodsBalance(address) {
    return await this.getBalance(address, this.goods);
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
      return {
        id: id,
        confirmed: true,
        price: "0",
      };
    };
    const balance = await this.getGoodsBalance(address, this.goods);
    const indices = range(balance);
    let items = await Promise.all(indices.map(getGood));
    if (address !== this.escrow.address) {
      const escrowGoods = (await this.getEscrowGoods()).filter((good) => {
        return good.seller === address;
      }).map((good) => {
        return {
          ...good,
          forSale: true,
          confirmed: true,
        };
      });
      items = [
        ...items,
        ...escrowGoods,
      ];
    }
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
    if (forSale) {
      console.log("setGoodForSale: Listing goodID", goodID);
      const priceWei = web3Utils.toWei(price, "ether");
      const priceHex = web3Utils.padLeft(web3Utils.toHex(priceWei), 64);
      await this.goods.safeTransferFrom(
        this.defaultAccount,
        this.escrow.address,
        goodID,
        priceHex,
      ).send();
    } else {
      console.log("setGoodForSale: Unlisting goodID", goodID);
      await this.escrow.unlist(goodID).send();
    }
  }

  // Escrow
  async createEscrowContract(coin, goods) {
    return await dapp.deployContract(Escrow, [coin, goods]);
  }

  loadEscrowContract() {
    this.escrow = this.dapp.getContractAt(Escrow);
  }

  async getEscrowGoods() {
    const augmentGood = async (good) => {
      const [price, seller] = await Promise.all([
        this.escrow.priceOf(good.id).call(),
        this.escrow.sellerOf(good.id).call(),
      ]);
      return {
        ...good,
        seller,
        price: web3Utils.fromWei(price),
      };
    };
    const goods = await this.getGoodsForAddress(this.escrow.address);
    return Promise.all(goods.map(augmentGood));
  }

  async buyGood(goodID) {
    const price = await this.escrow.priceOf(goodID).call();
    const data = this.escrow.swap(goodID).encodeABI();
    console.log("buyGood, goodID", goodID, "price", price, "data", data);
    await this.asobiCoin.approveAndCall(
      this.escrow.address,
      price,
      data,
    ).send();
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
