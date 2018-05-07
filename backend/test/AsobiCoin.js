const assertRejected = require("assert-rejected");
// const testHelper = require("truffle-test-helpers");
// const utils = require("web3-utils");

const Coin = artifacts.require("contracts/AsobiCoin.sol");

contract("AsobiCoin", accounts => {
  const account = accounts[0];
  const otherAccount = accounts[1];
  const thirdAccount = accounts[2];
  const options = {from: account};
  const otherOptions = {from: otherAccount};
  const thirdOptions = {from: thirdAccount};

  const coinAmount = 100;

  let coin;

  beforeEach(async () => {
    coin = await Coin.new();
  });

  it("should be created correctly", async () => {
    assert.equal(await coin.owner(), account);
  });

  describe("minting", () => {
    it("will let the owner mint", async () => {
      await coin.mint(account, coinAmount, options);
    });

    it("won't let others mint", async () => {
      await assertRejected(coin.mint(otherAccount, coinAmount, otherOptions));
    });
  });

  describe("transferring", () => {
    beforeEach(async () => {
      await coin.mint(account, coinAmount);
    });

    it("lets users transfer coins", async () => {
      await coin.approve(otherAccount, coinAmount, options);
      await coin.transferFrom(
        account, otherAccount, coinAmount, otherOptions,
      );
    });

    it("won't let the wrong user transfer", async () => {
      await coin.approve(otherAccount, coinAmount, options);
      await assertRejected(coin.transferFrom(
        account, otherAccount, coinAmount, thirdOptions,
      ));
    });
  });
});
