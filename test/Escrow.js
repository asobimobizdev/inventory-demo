const assertRejected = require("assert-rejected");
// const testHelper = require("truffle-test-helpers");
// const utils = require("web3-utils");

const Goods = artifacts.require("contracts/Goods.sol");
const AsobiCoin = artifacts.require("contracts/AsobiCoin.sol");
const Escrow = artifacts.require("contracts/Escrow.sol");

contract("Escrow", accounts => {
  const owner = accounts[0];
  const buyer = accounts[1];
  const seller = accounts[2];
  const buyerOptions = {from: buyer};
  const sellerOptions = {from: seller};

  const price = 1337;
  const goodID = 100;

  let asobiCoin;
  let goods;
  let escrow;

  beforeEach(async () => {
    asobiCoin = await AsobiCoin.new();
    goods = await Goods.new();
    escrow = await Escrow.new(asobiCoin.address, goods.address);

    await asobiCoin.mint(buyer, price);
    await goods.mint(seller, goodID);
  });

  describe("pricing", () => {
    it("won't let the owner set the price if not approved", async () => {
      await assertRejected(escrow.setPrice(goodID, price, sellerOptions));
    });
    describe("with approved transfer", () => {
      beforeEach(async () => {
        await goods.approve(escrow.address, goodID, sellerOptions);
      });
      it("will let the owner of a good set the price", async () => {
        await escrow.setPrice(goodID, price, sellerOptions);
        assert.equal(await escrow.getPrice(goodID), price);
      });

      it("won't let the owner set the price to 0", async () => {
        await assertRejected(escrow.setPrice(goodID, 0, sellerOptions));
      });

      it("won't let someone else set the price", async () => {
        await assertRejected(escrow.setPrice(goodID, price, buyerOptions));
      });
    });
  });

  describe("swap", () => {
    beforeEach(async () => {
      // approve the escrow to transfer the good
      await goods.approve(escrow.address, goodID, sellerOptions);
    });

    it("won't swap", async () => {
      await asobiCoin.approve(escrow.address, price - 1, buyerOptions);
      await assertRejected(escrow.swap(seller, goodID, buyerOptions));
    });

    describe("with price", () => {
      beforeEach(async () => {
        await escrow.setPrice(goodID, price, sellerOptions);
      });

      it("swaps when the buyer initiates", async () => {
        await asobiCoin.approve(escrow.address, price, buyerOptions);
        await escrow.swap(seller, goodID, buyerOptions);

        assert.equal(await goods.ownerOf(goodID), buyer);
        assert.equal(await asobiCoin.balanceOf(seller), price);
      });

      it("won't swap if the buyer does not approve enough", async () => {
        await asobiCoin.approve(escrow.address, price - 1, buyerOptions);
        await assertRejected(escrow.swap(seller, goodID, buyerOptions));
      });
    });
  });
});
