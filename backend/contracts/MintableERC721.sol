pragma solidity ^0.4.21;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol";


/**
 * @title MintableERC721 allows its owner to mint and burn new NFT
 */
contract MintableERC721 is Ownable, ERC721BasicToken {
    function mint(address _to, uint256 _tokenId) onlyOwner public {
        super._mint(_to, _tokenId);
    }

    function burn(uint256 _tokenId) onlyOwner public {
        super._burn(ownerOf(_tokenId), _tokenId);
    }
}
