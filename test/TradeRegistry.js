const assertRejected = require("assert-rejected");

const TradeRegistry = artifacts.require("contracts/TradeRegistry.sol");
const Trade = artifacts.require("contracts/Trade.sol");

contract("TradeRegistry", accounts => {
  const traderA = accounts[1];
  const traderB = accounts[2];
  const traderC = accounts[3];
  const traderAOptions = {from: traderA};
  const traderBOptions = {from: traderB};
  const traderCOptions = {from: traderC};

  let trade;
  let registry;

  beforeEach(async () => {
    registry = await TradeRegistry.new();
    trade = await Trade.new(
      "0x0",
      [traderA, traderB],
    );
  });

  it("has no trades in the beginning", async () => {
    assert.equal(await registry.numTrades(), 0);
  });

  it("will only let participating traders add a trade", async () => {
    await assertRejected(registry.add(trade.address, traderCOptions));
  });

  describe("one trade added", () => {
    beforeEach(async () => {
      await registry.add(trade.address, traderAOptions);
    });

    it("counts one trade", async () => {
      assert.equal(await registry.numTrades(), 1);
    });
  });
});
