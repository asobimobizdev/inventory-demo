const assertRejected = require("assert-rejected");
// const testHelper = require("truffle-test-helpers");
// const utils = require("web3-utils");

const Token = artifacts.require("contracts/Goods.sol");

contract("Goods", accounts => {
  const account = accounts[0];
  const otherAccount = accounts[1];
  const thirdAccount = accounts[2];
  const options = { from: account };
  const otherOptions = { from: otherAccount };
  const thirdOptions = { from: thirdAccount };

  const tokenId = 0;

  let token;

  beforeEach(async () => {
    token = await Token.new();
  });

  it("should be created correctly", async () => {
    assert.equal(await token.owner(), account);
  });

  describe("minting", () => {
    it("will let the owner mint", async () => {
      await token.mint(account, options);
    });

    it("won't let others mint", async () => {
      await assertRejected(token.mint(otherAccount, otherOptions));
    });
  });

  describe("transferring", () => {
    beforeEach(async () => {
      await token.mint(account);
    });

    it("lets users transfer tokens without approval", async () => {
      await token.transferFrom(
        account, otherAccount, tokenId, options,
      );
    });

    it("lets users transfer tokens", async () => {
      await token.approve(otherAccount, tokenId, options);
      await token.transferFrom(
        account, otherAccount, tokenId, otherOptions,
      );
    });

    it("won't let the wrong user transfer", async () => {
      await token.approve(otherAccount, tokenId, options);
      await assertRejected(token.transferFrom(
        account, otherAccount, tokenId, thirdOptions,
      ));
    });
  });
});
