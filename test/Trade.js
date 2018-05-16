const assertRejected = require("assert-rejected");
// const testHelper = require("truffle-test-helpers");
// const utils = require("web3-utils");

const Goods = artifacts.require("contracts/Goods.sol");
const Trade = artifacts.require("contracts/Trade.sol");

contract("Trade", accounts => {
  const traderA = accounts[1];
  const traderB = accounts[2];
  const traderAOptions = {from: traderA};
  const traderBOptions = {from: traderB};
  const thirdPerson = accounts[3];

  const item1 = 1;
  const item2 = 2;
  const item3 = 3;

  let goods;
  let trade;

  beforeEach(async () => {
    goods = await Goods.new();
    trade = await Trade.new(goods.address, [traderA, traderB]);
  });

  it("can be created", async () => {
    assert.equal(await trade.traders(0), traderA);
  });

  it("returns the correct number of traders", async () => {
    assert.equal(await trade.numTraders(), 2);
  });

  it("lets users check if they are traders", async () => {
    assert.isTrue(await trade.isTrader(traderA));
    assert.isFalse(await trade.isTrader(thirdPerson));
  });

  describe("final state", () => {
    it("is false in the beginning", async () => {
      assert.isFalse(await trade.isFinal());
    });

    describe("when trader A accepts", async () => {
      beforeEach(async () => {
        await trade.accept(traderAOptions);
      });

      it("is false if only one trader accepts", async () => {
        assert.isFalse(await trade.isFinal());
        assert.equal(await trade.numTradersAccepted(), 1);
      });

      it("lets trader A withdraw", async () => {
        await trade.withdraw(traderAOptions);
        assert.equal(await trade.numTradersAccepted(), 0);
      });
    });

    describe("when accepted", () => {
      beforeEach(async () => {
        await trade.accept(traderAOptions);
        await trade.accept(traderBOptions);
      });

      it("is true", async () => {
        assert.isTrue(await trade.isFinal());
      });

      it("won't let traders withdraw", async () => {
        await assertRejected(trade.withdraw(traderAOptions));
        await assertRejected(trade.withdraw(traderBOptions));
      });
    })
  });

  describe("adding goods", () => {
    beforeEach(async () => {
      await goods.mint(traderA, item1);
      await goods.mint(traderB, item2);
      await goods.mint(traderB, item3);

      await goods.approve(trade.address, item1, traderAOptions);
      await goods.approve(trade.address, item2, traderBOptions);
      await goods.approve(trade.address, item3, traderBOptions);
    });

    it("has no goods in the beginning", async () => {
      assert.equal(await trade.numGoods(), 0);
    });

    it("lets traders add goods", async () => {
      await trade.addGood(item1, traderAOptions);
      assert.equal((await trade.numGoods()).toNumber(), 1);
    });

    it("checks ownership", async () => {
      await assertRejected(trade.addGood(item1, traderBOptions));
    });

    describe("with one good added", () => {
      beforeEach(async () => {
        await trade.addGood(item1, traderAOptions);
      });

      it("knows how many trades one trader has", async () => {
        assert.equal(await trade.numTraderGoods(traderA), 1);
        await assertRejected(trade.numTraderGoods(thirdPerson));
      });

      it("keeps track of the individual goods offered", async () => {
        assert.equal(await trade.traderGoodByIndex(traderA, 0), item1);
      });

      it("lets you remove goods", async () => {
        await trade.removeGood(item1, traderAOptions);
        assert.equal((await trade.numTraderGoods(traderA)).toNumber(), 0);
        assert.equal((await trade.numGoods()).toNumber(), 0);
      });
    });

    describe("with all goods added", () => {
      beforeEach(async () => {
        await trade.addGood(item1, traderAOptions);
        await trade.addGood(item2, traderBOptions);
        await trade.addGood(item3, traderBOptions);
      });

      it("keeps correct counts", async () => {
        assert.equal((await trade.numTraderGoods(traderB)).toNumber(), 2);
        assert.equal((await trade.numGoods()).toNumber(), 3);

        await trade.removeGood(item2, traderBOptions);
        assert.equal((await trade.numTraderGoods(traderB)).toNumber(), 1);
        assert.equal((await trade.numGoods()).toNumber(), 2);

        await trade.removeGood(item3, traderBOptions);
        assert.equal((await trade.numTraderGoods(traderB)).toNumber(), 0);
        assert.equal((await trade.numGoods()).toNumber(), 1);
      });
    });
  });
});
