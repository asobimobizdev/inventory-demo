import Vuex from "vuex";
import { dapp } from "../lib/dapp";
import Repository from "../lib/repository";
import uuid from "uuid/v1";
import { p2pManager } from "../lib/p2p.js";
import seedParams from "../lib/seedParams";
import { Wallets } from "./../api/collections";

window.Wallets = Wallets;

const localStorage = window.localStorage;

const GOODS_ADDRESS = "0x67cE3ec51417B1Cf9101Fe5e664820CCdA60a89D";
const ASOBI_COIN_ADDRESS = "0xD4C267B592EaCCc9dFadFbFD73b87d5E8e61d144";
const ESCROW_ADDRESS = "0x0948D5B7d10E7a4C856A2cC74F68F5E05aEEa93B";

function growGoodFromId(id) {
  let good = {};
  good.seed = seedParams.seedFromString(id);
  good.hue = seedParams.hueFromSeed(good.seed);
  good.name = seedParams.nameForSeedWithHSL(good.seed, good.hue + 35, 80, 70);

  return good;
}

const repository = new Repository(dapp);

const createStore = () => {
  return new Vuex.Store({
    state: {
      dappInit: false,
      isGoodsAdmin: false,
      isAsobiCoinAdmin: false,
      accountAddress: null,
      goods: [],
      goodsLoading: false,
      friends: [],
      friendsLoading: false,
      friendGoods: [],
      friendGoodsLoading: false,
      selectedFriendId: null,
      unconfirmedTransactions: {},
      selectedGoodId: null,
      balance: 0,
    },
    mutations: {
      ["dapp/initialized"](state, isInit) {
        state.dappInit = isInit;
      },
      ["isGoodsAdmin"](state, isGoodsAdmin) {
        state.isGoodsAdmin = isGoodsAdmin;
      },
      ["isAsobiCoinAdmin"](state, isAsobiCoinAdmin) {
        state.isAsobiCoinAdmin = isAsobiCoinAdmin;
      },
      ["goods"](state, goods) {
        // goods.forEach(good => {
        //   if (!state.selectedFriendId) return;
        //   const to = state.selectedFriendId;
        //   const from = state.accountAddress;
        //   const tID = `${to}-${from}-${good.id}`;
        //   delete state.unconfirmedTransactions[tID];
        //   state.unconfirmedTransactions = { ...state.unconfirmedTransactions };
        // });

        goods = goods.map(good => {
          return {
            ...good,
            ...growGoodFromId(good.id),
            isOwned: true,
          };
        });

        state.goods = goods;
      },
      ["goodsLoading"](state, loading) {
        state.goodsLoading = loading;
      },
      ["friends"](state, friends) {
        state.friends = friends || [
          {
            name: "Me",
            id: state.accountAddress,
          },
        ];
      },
      ["friendsLoading"](state, loading) {
        state.friendsLoading = loading;
      },
      ["friendGoods"](state, goods) {
        // goods.forEach(good => {
        //   const from = state.accountAddress;
        //   const to = state.selectedFriendId;
        //   const tID = `${from}-${to}-${good.id}`;
        //   delete state.unconfirmedTransactions[tID];
        //   state.unconfirmedTransactions = { ...state.unconfirmedTransactions };
        // });

        goods = goods.map(good => {
          return {
            ...good,
            ...growGoodFromId(good.id),
            isOwned: false,
          };
        });

        state.friendGoods = goods;
      },
      ["friendGoodsLoading"](state, loading) {
        state.friendGoodsLoading = loading;
      },
      ["markConfirmed"](state, goodId) {
        const index = state.goods.find(
          (good) => { return good.id === goodId; },
        );
        state.goods[index].confirmed = true;
      },
      ["selectedFriendId"](state, id) {
        state.selectedFriendId = id;
      },
      ["accountAddress"](state, address) {
        state.accountAddress = address;
      },
      ["addUnconfirmedTransaction"](state, transaction) {
        const tID = `${transaction.from}-${transaction.to}-${transaction.goodID}`;
        state.unconfirmedTransactions = { [tID]: transaction, ...state.unconfirmedTransactions };
      },
      ["removeUnconfirmedTransaction"](state, transaction) {
        const tID = `${transaction.from}-${transaction.to}-${transaction.goodID}`;
        delete state.unconfirmedTransactions[tID];
        state.unconfirmedTransactions = { ...state.unconfirmedTransactions };

        if(transaction.confirmed){
          const goodID = transaction.goodID;
          if(transaction.to == state.accountAddress){
            const good = state.friendGoods.find(good => good.id == goodID );
            state.friendGoods = state.friendGoods.filter( good => good.id != goodID );
            state.goods = [...state.goods, ...[good]];
          }else{
            const good = state.goods.find(good => good.id == goodID );
            state.goods = state.goods.filter( good => good.id != goodID );
            state.friendGoods = [...state.friendGoods, ...[good]];
          }
        }
      },
      ["selectedGoodId"](state, id) {
        state.selectedGoodId = id;
      },
      ["balance"](state, balance) {
        state.balance = dapp.web3.utils.fromWei(balance);
      },
      ["setGoodForSale"](state, { id, forSale, price, confirmed } ){
        state.goods = state.goods.map(good => {
          if(good.id == id){
            good.forSale = forSale;
            good.price = price;
            good.confirmed = confirmed;
            good = {...good};
          }
          return good;
        });
      },

    },
    actions: {
      selectFriend(context, id) {
        context.commit("selectedFriendId", id);
        context.dispatch("getSelectedFriendGoods");
      },

      subscribeToFriends(context) {
        const handle = Meteor.subscribe("friendsWallets");

        Meteor.autorun(_ => {
          if (!handle.ready()) return;
          let friends = Wallets.find({}).fetch();
          context.commit("friends", friends);
          if (friends.length > 0) {
            context.dispatch("getSelectedFriendGoods");
          }
        });
      },

      addFriend(context, friend) {
        Wallets.insert(friend);
      },

      deleteFriend(context, friend) {
        Wallets.remove(friend._id);
      },

      async getBalance(context) {
        context.commit(
          "balance",
          await repository.getAsobiCoinBalance(
            context.state.accountAddress,
          ),
        );
      },

      async getOwnGoods(context) {
        context.commit("goodsLoading", true);
        let goods = await repository.getGoodsForAddress(
          context.state.accountAddress,
        );
        context.commit("goods", goods);
        context.commit("goodsLoading", false);
      },

      async getSelectedFriendGoods(context) {
        if (!context.state.selectedFriendId) {
          return;
        }

        let address = context.state.selectedFriendId;

        context.commit("friendGoodsLoading", true);
        const goods = await repository.getGoodsForAddress(
          address,
        );

        context.commit("friendGoods", goods);
        context.commit("friendGoodsLoading", false);
      },

      async createAsobiCoinContract(context) {
        const contract = await dapp.deployContract(
          dapp.contracts.AsobiCoin, []
        );
      },

      async createGoodsContract(context) {
        const contract = await dapp.deployContract(
          dapp.contracts.Goods, []
        );
      },

      async createEscrowContract(context) {
        const contract = await dapp.deployContract(
          dapp.contracts.Escrow, [
            repository.c.asobiCoinContract.options.address,
            repository.c.goodsContract.options.address,
          ]
        );
      },

      getGoodsContract(context) {
        repository.c.goodsContract = dapp.getContractAt(
          dapp.contracts.Goods,
          GOODS_ADDRESS,
        );
        repository.c.goodsContractEvents = dapp.getContractAt(
          dapp.contracts.Goods,
          GOODS_ADDRESS,
          dapp.web3Event,
        );

        repository.c.goodsContractEvents.events.allEvents()
          .on("data", (event) => {
            console.log("Goods event", event);
          })
          .on("error", console.log);

        p2pManager.subscribe(context.state.accountAddress, context);
      },

      getAsobiCoinContract(context) {
        repository.c.asobiCoinContract = dapp.getContractAt(
          dapp.contracts.AsobiCoin,
          ASOBI_COIN_ADDRESS,
        );
        repository.c.asobiCoinContractEvents = dapp.getContractAt(
          dapp.contracts.AsobiCoin,
          ASOBI_COIN_ADDRESS,
          dapp.web3Event,
        );
        repository.c.asobiCoinContractEvents.events.Transfer()
          .on("data", (event) => {
            console.log("AsobiCoin Transfer event", event);
            context.dispatch("getBalance");
          })
          .on("error", console.log);
      },

      getEscrowContract(context) {
        repository.c.escrowContract = dapp.getContractAt(
          dapp.contracts.Escrow,
          ESCROW_ADDRESS,
        );
        repository.c.escrowContractEvents = dapp.getContractAt(
          dapp.contracts.Escrow,
          ESCROW_ADDRESS,
          dapp.web3Event,
        );
        repository.c.escrowContractEvents.events.PriceSet()
          .on("data", (event) => {
            console.log("Escrow PriceSet event", event);
            context.dispatch("getOwnGoods");
            context.dispatch("getSelectedFriendGoods");
          })
          .on("error", console.log);
      },

      async transferGoodToSelectedFriend(context, good) {
        let address = context.state.selectedFriendId;

        const goodID = good.id;

        const transaction = {
          from: context.state.accountAddress,
          to: address, goodID: good.id,
        };

        context.commit("addUnconfirmedTransaction", transaction);
        p2pManager.addUnconfirmedTransaction(context.state.accountAddress, address, goodID);

        try{

          await repository.transferGood(
            goodID,
            context.state.accountAddress,
            address,
            repository.c.goodsContract,
          );
          transaction.confirmed = true;
          context.commit("removeUnconfirmedTransaction", transaction);
          p2pManager.removeUnconfirmedTransaction(context.state.accountAddress, address, goodID, true);

        }catch(e){
          transaction.confirmed = false;
          context.commit("removeUnconfirmedTransaction", transaction);
          p2pManager.removeUnconfirmedTransaction(context.state.accountAddress, address, goodID, false);
        }

      },

      async checkGoodsAdmin(context) {
        const isOwner = await repository.isGoodsAdmin(
          context.state.accountAddress,
        );
        context.commit("isGoodsAdmin", isOwner);
      },

      async checkAsobiCoinAdmin(context) {
        const isOwner = await repository.isAsobiCoinAdmin(
          context.state.accountAddress,
        );
        context.commit("isAsobiCoinAdmin", isOwner);
      },

      async createGoodFor(context, address) {
        await repository.createGood(
          address,
        );
      },

      async setGoodForSale(context, { id, forSale, price }) {
        const oldGoodState = {...context.state.goods.find((good)=>{
          return good.id == id;
        })};
        context.commit("setGoodForSale", { id, forSale, price, confirmed:false });
        try {
          price = String(price);
          await repository.setGoodForSale(
            id, price, forSale,
          );
        } catch(e) {
          context.commit("setGoodForSale", oldGoodState);
        }
      },

      async buyGood(context, { id }) {
        await repository.buyGood(id, context.state.accountAddress);
      },

      async sendCoinsToFriend(context, { friend, amount }) {
        await repository.createCoin(
          friend.id,
          dapp.web3.utils.toWei(amount, "ether"),
        );
      },
    },
    getters: {
      selectFriend: state => {
        const friend = state.friends.find(friend => {
          return friend.id == state.selectedFriendId;
        });
        return friend;
      },
      selectedGood: (state,getters) =>{
        if(!state.selectedGoodId) return null;
        let selectedGood = getters.allGoods.find(good =>{
          return good.id == state.selectedGoodId;
        });

        if(!selectedGood){
          selectedGood = getters.allFriendGoods.find(good =>{
            return good.id == state.selectedGoodId;
          });
        }

        return selectedGood;
      },
      allGoods: state => {
        let transaction;
        const unconfirmedGoods = [];
        const goodsToRemove = {};

        for (let tID in state.unconfirmedTransactions) {
          transaction = state.unconfirmedTransactions[tID];

          if (transaction.from == state.accountAddress) {
            goodsToRemove[transaction.goodID] = transaction.goodID;
            continue;
          }

          unconfirmedGoods.push({
            id: transaction.goodID,
            confirmed: false,
            ...growGoodFromId(transaction.goodID),
          });
        }

        const goods = state.goods.filter(good => {
          return !goodsToRemove[good.id];
        });

        return [...goods, ...unconfirmedGoods];
      },

      allFriendGoods: state => {
        let transaction;
        const unconfirmedGoods = [];
        const goodsToRemove = {};

        const friend = state.friends.find(friend => {
          return friend.id == state.selectedFriendId;
        });
        if (!friend) return;

        for (let tID in state.unconfirmedTransactions) {
          transaction = state.unconfirmedTransactions[tID];
          if (transaction.from == friend.id) {
            goodsToRemove[transaction.goodID] = transaction.goodID;
            continue;
          }
          if (transaction.to != friend.id) continue;

          unconfirmedGoods.push({
            id: transaction.goodID,
            confirmed: false,
            ...growGoodFromId(transaction.goodID),
          });
        }

        const goods = state.friendGoods.filter(good => {
          return !goodsToRemove[good.id];
        });

        return [...goods, ...unconfirmedGoods];
      },
    },
  });
};
export default createStore;
