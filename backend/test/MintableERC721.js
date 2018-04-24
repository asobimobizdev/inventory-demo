const assertRejected = require("assert-rejected");
// const testHelper = require("truffle-test-helpers");
// const utils = require("web3-utils");

const Token = artifacts.require("contracts/MintableERC721.sol");

contract("MintableERC721", accounts => {
  let token;

  let options = {from: accounts[0]};
  let otherOptions = {from: accounts[1]};

  before(async () => {
  });

  beforeEach(async () => {
    token = await Token.new();
  });

  it("should be created correctly", async () => {
    assert.equal(await token.owner(), accounts[0]);
  });

  it("will let the owner mint", async () => {
    await token.mint(accounts[1], 0, options);
  });

  it("won't let others mint", async () => {
    await assertRejected(token.mint(accounts[1], 0, otherOptions));
  });
});
