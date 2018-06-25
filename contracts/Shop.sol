pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "contracts/Goods.sol";


/**
  * @title Shop contract that allows self-service minting
  */
contract Shop {

    uint256 constant MINT_AMOUNT = 1000 ether;
    uint8 constant GOODS_AMOUNT = 32;

    MintableToken asobiCoin;
    Goods erc721;

    constructor(MintableToken _asobiCoin, Goods _erc721) public {
        require(_asobiCoin != address(0));
        require(_erc721 != address(0));
        asobiCoin = _asobiCoin;
        erc721 = _erc721;
    }

    /**
      * @dev buy a predetermined amount of goods and asobicoin
      */
    function buy() external {
        asobiCoin.mint(msg.sender, MINT_AMOUNT);
        for (uint256 goods; goods < GOODS_AMOUNT; goods++) {
            erc721.mint(msg.sender);
        }
    }
}
