pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";


/**
 * @title Goods contract
 */
contract Goods is Ownable, ERC721Token {
    constructor()
        public
        ERC721Token("Goods", "GDS") {
    }

    /**
      * @dev Mint a good with an ID and transfer it to someone
      * @dev Can only be called by the contract owner
      * @param _to The receiver of the newly minted good
      * @param _tokenId The ID of the good
      */
    function mint(address _to, uint256 _tokenId) onlyOwner public {
        super._mint(_to, _tokenId);
    }

    /**
      * @dev Destroy a good
      * @dev Can only be called by the contract owner
      * @param _tokenId The ID of the good
      */
    function burn(uint256 _tokenId) onlyOwner public {
        super._burn(ownerOf(_tokenId), _tokenId);
    }
}
