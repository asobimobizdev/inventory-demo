pragma solidity ^0.4.22;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";


/**
 * @title Goods
 */
contract Goods is Ownable, ERC721Token {
    constructor()
        public
        ERC721Token("Goods", "GDS") {
    }

    function mint(address _to, uint256 _tokenId) onlyOwner public {
        super._mint(_to, _tokenId);
    }

    function burn(uint256 _tokenId) onlyOwner public {
        super._burn(ownerOf(_tokenId), _tokenId);
    }
}
