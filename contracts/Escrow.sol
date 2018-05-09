pragma solidity ^0.4.23;
import "./AsobiCoin.sol";
import "./Goods.sol";


contract Escrow {
    AsobiCoin asobiCoin;
    Goods goods;

    mapping(uint256 => uint256) goodPrices;

    constructor(AsobiCoin _asobiCoin, Goods _goods) public {
        asobiCoin = _asobiCoin;
        goods = _goods;
    }

    function getPrice(uint256 goodID) public view returns (uint256) {
        return goodPrices[goodID];
    }

    function setPrice(uint256 goodID, uint256 price) external {
        require(goods.ownerOf(goodID) == msg.sender);
        require(price > 0);

        goodPrices[goodID] = price;
    }

    function swap(address seller, uint256 goodID) external {
        address buyer = msg.sender;
        uint256 price = getPrice(goodID);
        require(price > 0);

        require(asobiCoin.transferFrom(buyer, seller, price));
        goods.transferFrom(seller, buyer, goodID);
    }
}
