pragma solidity ^0.4.23;
import "contracts/AsobiCoin.sol";
import "contracts/Goods.sol";


contract Escrow {
    AsobiCoin asobiCoin;
    Goods goods;

    mapping(uint256 => uint256) goodPrices;

    constructor(AsobiCoin _asobiCoin, Goods _goods) public {
        asobiCoin = _asobiCoin;
        goods = _goods;
    }

    function isListed(uint256 goodID) public view returns (bool) {
        return goodPrices[goodID] > 0;
    }

    function getPrice(uint256 goodID) public view returns (uint256) {
        return goodPrices[goodID];
    }

    function setPrice(uint256 goodID, uint256 price) external {
        require(goods.ownerOf(goodID) == msg.sender);
        require(goods.getApproved(goodID) == address(this));
        require(price > 0);

        goodPrices[goodID] = price;
    }

    function swap(uint256 goodID) external {
        require(isListed(goodID));
        address buyer = msg.sender;
        address seller = goods.ownerOf(goodID);
        uint256 price = getPrice(goodID);

        require(asobiCoin.transferFrom(buyer, seller, price));
        goods.transferFrom(seller, buyer, goodID);
    }
}
