import { dapp } from "@/lib/dapp";
import Repository from "@/repository";
import Vuex from "vuex";
// import { p2pManager } from "../lib/p2p.js";
import live from "./live";
import seedParams from "../lib/seedParams";
import trade from "./trade";

export function decorateGoodWithId(id) {
  let good = {};
  good.seed = seedParams.seedFromString(id);
  good.name = seedParams.nameForSeed(good.seed);
  good.thumbPath = seedParams.assetsThumbPathWithSeed(good.seed);
  return good;
}

export const repository = new Repository(dapp);

const createStore = () => {
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    modules: {
      trade,
      live,
    },
    state: {
      dappInit: false,
      isGoodsAdmin: false,
      isAsobiCoinAdmin: false,
      accountAddress: null,
      goods: [],
      goodsLoading: false,
      registered: false,
      userName: null,
      friends: [],
      friendsLoading: false,
      friendGoods: [],
      friendGoodsLoading: false,
      selectedFriendId: null,
      unconfirmedTransactions: {},
      selectedGoodId: null,
      balance: 0,
      transactions: [],
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
        goods = goods.map(good => {
          return {
            ...good,
            ...decorateGoodWithId(good.id),
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
        goods = goods.map(good => {
          return {
            ...good,
            ...decorateGoodWithId(good.id),
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
        // TODO(Giosue) refactor me
        const tID = `${transaction.from}-${transaction.to}-${transaction.goodID}`;
        state.unconfirmedTransactions = {
          [tID]: transaction,
          ...state.unconfirmedTransactions,
        };
      },
      ["removeUnconfirmedTransaction"](state, transaction) {
        // TODO(Giosue) refactor me
        const tID = `${transaction.from}-${transaction.to}-${transaction.goodID}`;
        if (!state.unconfirmedTransactions[tID]) return;
        delete state.unconfirmedTransactions[tID];
        state.unconfirmedTransactions = { ...state.unconfirmedTransactions };
      },
      ["selectedGoodId"](state, id) {
        state.selectedGoodId = id;
      },
      ["balance"](state, balance) {
        state.balance = dapp.web3.utils.fromWei(balance);
      },
      ["setGoodForSale"](state, { id, forSale, price, confirmed }) {
        state.goods = state.goods.map(good => {
          if (good.id == id) {
            good.forSale = forSale;
            good.price = price;
            good.confirmed = confirmed;
            good = { ...good };
          }
          return good;
        });
      },
      ["setGoodPrice"](state, { goodID, price }) {
        const good = state.goods.find(good => good.id == goodID);
        good.price = price;
      },
      ["setRegistered"](state, { userName, registered }) {
        state.registered = registered;
        state.userName = userName;
      },
      ["trades"](state, trades) {
        state.trades = trades;
      },
    },
    actions: {
      selectedFriendId(context, id) {
        context.commit("selectedFriendId", id);
        context.dispatch("getSelectedFriendGoods", true);
        // p2pManager.subscribe(id, context);
      },

      async getFriends(context) {
        let friends = await repository.getFriends();
        context.commit("friends", friends);
        if (friends.length > 0) {
          context.dispatch("getSelectedFriendGoods", true);
        }
      },

      async addFriend(context, { name }) {
        await repository.registerUser(name);
      },

      async unregisterUser(context) {
        await repository.unregisterUser();
      },

      async getRegisterState(context) {
        const result = await repository.getRegisterState(
          context.state.accountAddress,
        );
        console.log("getRegisterState", result);
        context.commit("setRegistered", result);
      },

      async getBalance(context) {
        context.commit(
          "balance",
          await repository.getAsobiCoinBalance(
            context.state.accountAddress,
          ),
        );
      },

      async getOwnGoods(context, loading = false) {
        if (loading) {
          context.commit("goodsLoading", true);
        }
        let goods = await repository.getGoodsForAddress(
          context.state.accountAddress,
        );
        context.commit("goods", goods);
        if (loading) {
          context.commit("goodsLoading", false);
        }
      },

      async getSelectedFriendGoods(context, loading = false) {
        if (!context.state.selectedFriendId) {
          return;
        }

        let address = context.state.selectedFriendId;

        if (loading) {
          context.commit("friendGoodsLoading", true);
        }
        const goods = await repository.getGoodsForAddress(
          address,
        );

        context.commit("friendGoods", goods);
        if (loading) {
          context.commit("friendGoodsLoading", false);
        }
      },

      async createContracts(context) {
        const [coin, goods, tradeRegistry, userRegistry] = await Promise.all([
          repository.createAsobiCoinContract(),
          repository.createGoodsContract(),
          repository.createTradeRegistry(),
          repository.createUserRegistry(),
        ]);
        const [escrow, shop] = await Promise.all([
          repository.createEscrowContract(coin, goods),
          repository.createShopContract(coin, goods),
        ]);

        await repository.transferOwnershipsToShop(coin, goods, shop);

        const networkIdentifier = repository.networkIdentifier;
        console.log(`
  "${networkIdentifier}":
    AsobiCoin: "${coin}"
    Escrow: "${escrow}"
    Goods: "${goods}"
    Shop: "${shop}"
    TradeRegistry: "${tradeRegistry}"
    UserRegistry: "${userRegistry}"
`,
        );
      },

      getGoodsContract(context) {
        repository.loadGoodsContract();

        repository.goodsTransferEvents()
          .on("data", async (data) => {

            const transaction = {
              from: data.returnValues._from,
              to: data.returnValues._to,
              goodID: data.returnValues._tokenId,
              confirmed: true,
            };

            console.log("Good Transaction", transaction);

            await Promise.all([
              context.dispatch("getOwnGoods"),
              context.dispatch("getSelectedFriendGoods"),
            ]);

            context.commit("removeUnconfirmedTransaction", transaction);
          })
          .on("error", console.log);

        // p2pManager.subscribe(context.state.accountAddress, context);
      },

      getAsobiCoinContract(context) {
        repository.loadAsobiCoinContract();
        repository.asobiCoinTransferEvents((event) => {
          console.log("AsobiCoin Transfer event", event);
          context.dispatch("getBalance");
        });
      },

      getEscrowContract(context) {
        repository.loadEscrowContract();
        repository.escrowListedEvents()
          .on("data", (event) => {
            console.log("Escrow Listed event", event);
            context.dispatch("getOwnGoods");
            context.dispatch("getSelectedFriendGoods");
          })
          .on("error", console.log);
      },

      getUserRegistryContract(context) {
        repository.loadUserRegistryContract();
        repository.userRegistryEvents()
          .on("data", (event) => {
            console.log("User Registry event", event);
            context.dispatch("getRegisterState");
            context.dispatch("getFriends");
          })
          .on("error", console.log);
      },

      getTradeRegistryContract(context) {
        repository.loadTradeRegistryContract();
        repository.tradeRegistryEvents()
          .on("data", (event) => {
            console.log("Trade Registry event", event);
            context.dispatch("trade/loadTrade");
          })
          .on("error", console.log);
      },

      async transferGoodToSelectedFriend(context, good) {
        let address = context.state.selectedFriendId;

        const goodID = good.id;

        const transaction = {
          from: context.state.accountAddress,
          to: address,
          goodID: good.id,
        };

        context.commit("addUnconfirmedTransaction", transaction);
        // p2pManager.addUnconfirmedTransaction(
        //   context.state.accountAddress,
        //   address,
        //   goodID,
        // );

        try {
          await repository.transferGood(
            context.state.accountAddress,
            address,
            goodID,
          );
        } catch (e) {
          transaction.confirmed = false;
          context.commit("removeUnconfirmedTransaction", transaction);
          console.error(e);
          // p2pManager.removeUnconfirmedTransaction(
          //   context.state.accountAddress,
          //   address,
          //   goodID,
          //   false,
          // );
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
        const oldGoodState = {
          ...context.state.goods.find((good) => {
            return good.id == id;
          }),
        };
        context.commit(
          "setGoodForSale",
          { id, forSale, price, confirmed: false },
        );
        try {
          price = String(price);
          await repository.setGoodForSale(
            id, price, forSale,
          );
        } catch (e) {
          context.commit("setGoodForSale", oldGoodState);
          console.error(e);
        }
      },

      async buyGood(context, { id }) {

        const transaction = {
          from: context.state.selectedFriendId,
          to: context.state.accountAddress,
          goodID: id,
        };

        context.commit("addUnconfirmedTransaction", transaction);
        // p2pManager.addUnconfirmedTransaction(
        //   transaction.from,
        //   transaction.to,
        //   transaction.goodID,
        // );

        try {
          await repository.buyGood(id, context.state.accountAddress);
        } catch (e) {
          transaction.confirmed = false;
          context.commit("removeUnconfirmedTransaction", transaction);
          console.error(e);
          // p2pManager.removeUnconfirmedTransaction(
          //   transaction.from,
          //   transaction.to,
          //   transaction.goodID,
          //   false,
          // );
        }
      },

      async sendCoinsToFriend(context, { friend, amount }) {
        await repository.createCoin(
          friend.id,
          dapp.web3.utils.toWei(amount, "ether"),
        );
      },
    },
    getters: {
      otherUsers: state => {
        const friends = state.friends.filter(friend => {
          return friend.id !== state.accountAddress;
        });
        return friends;
      },
      selectedFriend: state => {
        const friend = state.friends.find(friend => {
          return friend.id == state.selectedFriendId;
        });
        return friend;
      },
      selectedGood: (state, getters) => {
        if (!state.selectedGoodId) return null;
        let selectedGood = getters.allGoods.find(good => {
          return good.id == state.selectedGoodId;
        });

        if (!selectedGood) {
          selectedGood = getters.allFriendGoods.find(good => {
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

          if (transaction.from == state.accountAddress || transaction.to != state.accountAddress) {
            goodsToRemove[transaction.goodID] = transaction.goodID;
            continue;
          }

          unconfirmedGoods.push({
            id: transaction.goodID,
            confirmed: false,
            ...decorateGoodWithId(transaction.goodID),
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
            ...decorateGoodWithId(transaction.goodID),
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
