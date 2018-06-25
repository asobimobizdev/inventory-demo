pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";


/**
 * @title Goods contract
 */
contract Goods is Ownable, ERC721Token {

    uint256 tokenCount;

    constructor()
        public
        ERC721Token("Goods", "GDS") {
    }

    /**
      * @dev Mint a good with an ID and transfer it to someone
      * @dev Can only be called by the contract owner
      * @param _to The receiver of the newly minted good
      */
    function mint(address _to) onlyOwner public {
        super._mint(_to, tokenCount);
        tokenCount++;
    }
}
