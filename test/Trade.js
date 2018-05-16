const assertRejected = require("assert-rejected");
// const testHelper = require("truffle-test-helpers");
// const utils = require("web3-utils");

const Goods = artifacts.require("contracts/Goods.sol");
const Trade = artifacts.require("contracts/Trade.sol");

contract("Trade", accounts => {
  const playerA = accounts[1];
  const playerB = accounts[2];
  const playerAOptions = {from: playerA};
  const playerBOptions = {from: playerB};

  let goods;
  let trade;

  beforeEach(async () => {
    goods = await Goods.new();
    trade = await Trade.new(goods.address, [playerA, playerB]);
    // await goods.mint(seller, goodID);
  });

  it("can be created", async () => {
    assert.equal(await trade.traders(0), playerA);
  });

  it("returns the correct number of traders", async () => {
    assert.equal(await trade.numTraders(), 2);
  });
});
