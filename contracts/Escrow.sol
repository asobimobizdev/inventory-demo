pragma solidity ^0.4.23;

import "contracts/AsobiCoin.sol";
import "contracts/Goods.sol";


/**
  * @title Escrow contract that allows atomic swaps of AsobiCoin and Goods
  */
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

    /**
     * @dev Set the price for a good
     * @param goodID the good to set the price for
     * @param price the price to set
     */
    function setPrice(uint256 goodID, uint256 price) external {
        address seller = msg.sender;
        require(goods.ownerOf(goodID) == seller);
        require(price > 0);

        goodPrices[goodID] = price;
        emit PriceSet(seller, goodID, price);
    }

    /**
      * @dev Initiate an escrow swap
      @ @param goodID the good to swap
      */
    function swap(uint256 goodID) external {
        require(isListed(goodID));

        // solium-disable-next-line security/no-tx-origin
        address buyer = tx.origin;
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

    /**
      * @dev Determine whether an item is listed
      * @param goodID The id of the good to check
      * @return Return true if item is listed
      */
    function isListed(uint256 goodID) public view returns (bool) {
        return goodPrices[goodID] > 0 &&
            goods.getApproved(goodID) == address(this);
    }

    /**
      * @dev Get the price for an item
      * @dev goodID The id of the good to check
      * @return Return the price in AsobiCoin as uint256
      */
    function getPrice(uint256 goodID) public view returns (uint256) {
        return goodPrices[goodID];
    }
}
