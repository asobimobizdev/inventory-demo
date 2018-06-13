const assertRejected = require("assert-rejected");
// const testHelper = require("truffle-test-helpers");
// const utils = require("web3-utils");
const web3Utils = require("web3-utils");

const Goods = artifacts.require("contracts/Goods.sol");
const AsobiCoin = artifacts.require("contracts/AsobiCoin.sol");
const Escrow = artifacts.require("contracts/Escrow.sol");

contract("Escrow", accounts => {
  const buyer = accounts[1];
  const seller = accounts[2];
  const buyerOptions = {from: buyer};
  const sellerOptions = {from: seller};

  const price = 256;
  0x0000000000000000000000000000000000000000000000000000000000000100;
  const priceHex = web3Utils.padLeft(
    web3Utils.toHex(price),
    64
  );
  const zeroPriceHex = web3Utils.padLeft(
    web3Utils.toHex(0),
    64
  );

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

  describe("listing", () => {
    it("lets the owner list an object", async () => {
      await goods.safeTransferFrom(
        seller,
        escrow.address,
        goodID,
        priceHex,
        sellerOptions,
      );
      assert.isTrue(await escrow.isListed(goodID));
    });

    it("won't let the owner set the price to 0", async () => {
      await assertRejected(
        goods.safeTransferFrom(
          seller,
          escrow.address,
          goodID,
          zeroPriceHex,
          sellerOptions,
        )
      );
    });
  });

  describe("isListed", () => {
    it("knows who listed", async () => {
      await goods.safeTransferFrom(
        seller,
        escrow.address,
        goodID,
        priceHex,
        sellerOptions,
      );
      assert.equal(await escrow.priceOf(goodID), price);
      assert.equal(await escrow.sellerOf(goodID), seller);
    });
  });

  describe("swap", () => {
    beforeEach(async () => {
      // approve the escrow to transfer the good
      await goods.safeTransferFrom(
        seller,
        escrow.address,
        goodID,
        priceHex,
        sellerOptions,
      );
    });
    it("swaps when the buyer initiates", async () => {
      await asobiCoin.approve(escrow.address, price, buyerOptions);
      await escrow.swap(goodID, buyerOptions);

      assert.equal(await goods.ownerOf(goodID), buyer);
      assert.equal(await asobiCoin.balanceOf(seller), price);
    });

    it("won't swap if the buyer does not approve enough", async () => {
      await asobiCoin.approve(escrow.address, price - 1, buyerOptions);
      await assertRejected(escrow.swap(goodID, buyerOptions));
    });
  });
});
