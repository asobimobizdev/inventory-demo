pragma solidity ^0.4.23;

import "contracts/AsobiCoin.sol";
import "contracts/Goods.sol";


contract Escrow {

    event Swapped(
        address _buyer,
        address _seller,
        uint256 _goodID,
        uint256 _price
    );
    event PriceSet(address _seller, uint256 _goodID, uint256 _price);

    AsobiCoin asobiCoin;
    Goods goods;

    mapping(uint256 => uint256) goodPrices;

    constructor(AsobiCoin _asobiCoin, Goods _goods) public {
        asobiCoin = _asobiCoin;
        goods = _goods;
    }

    function setPrice(uint256 goodID, uint256 price) external {
        address seller = msg.sender;
        require(goods.ownerOf(goodID) == seller);
        require(price > 0);

        goodPrices[goodID] = price;
        emit PriceSet(seller, goodID, price);
    }

    function swap(uint256 goodID) external {
        require(isListed(goodID));

        address buyer = msg.sender;
        address seller = goods.ownerOf(goodID);
        uint256 price = getPrice(goodID);

        require(asobiCoin.transferFrom(buyer, seller, price));
        goods.transferFrom(seller, buyer, goodID);

        emit Swapped(
            buyer,
            seller,
            goodID,
            price
        );
    }

    function isListed(uint256 goodID) public view returns (bool) {
        return goodPrices[goodID] > 0 &&
            goods.getApproved(goodID) == address(this);
    }

    function getPrice(uint256 goodID) public view returns (uint256) {
        return goodPrices[goodID];
    }
}
