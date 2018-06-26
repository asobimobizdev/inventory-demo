pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol";


/**
  * @title Escrow contract that allows atomic swaps of ERC20 and ERC721
  */
contract Escrow is ERC721Receiver {

    event Swapped(
        address indexed _buyer,
        address indexed _seller,
        uint256 indexed _tokenId,
        uint256 _price
    );
    event Listed(
        address indexed _seller,
        uint256 indexed _tokenId,
        uint256 _price
    );
    event Unlisted(
        address indexed _seller,
        uint256 indexed _tokenId
    );

    ERC20 asobiCoin;
    ERC721 erc721;

    mapping(uint256 => uint256) public priceOf;
    mapping(uint256 => address) public sellerOf;

    constructor(ERC20 _asobiCoin, ERC721 _erc721) public {
        require(_asobiCoin != address(0));
        require(_erc721 != address(0));
        asobiCoin = _asobiCoin;
        erc721 = _erc721;
    }

    /**
      * @dev Initiate an escrow swap
      @ @param _tokenId the good to swap
      */
    function swap(uint256 _tokenId) external {
        require(isListed(_tokenId));

        address seller = sellerOf[_tokenId];
        // solium-disable-next-line security/no-tx-origin
        address buyer = tx.origin;
        uint256 _price = priceOf[_tokenId];

        require(asobiCoin.transferFrom(buyer, seller, _price));
        erc721.transferFrom(address(this), buyer, _tokenId);

        removeListing(_tokenId);

        emit Swapped(
            buyer,
            seller,
            _tokenId,
            _price
        );
    }

    /**
      * @dev Unlist an item
      * @dev Can only be called by the item seller
      * @param _tokenId the item to unlist
      */
    function unlist(uint256 _tokenId) external {
        require(isListed(_tokenId));
        address seller = sellerOf[_tokenId];
        require(seller == msg.sender);

        erc721.transferFrom(address(this), seller, _tokenId);

        removeListing(_tokenId);

        emit Unlisted(seller, _tokenId);
    }

    /**
     * @dev List a good using a ERC721 receiver hook
     * @param _seller the good seller
     * @param _tokenId the good id to list
     * @param _data contains the pricing data as the first 32 bytes
     */
    function onERC721Received(address _seller, uint256 _tokenId, bytes _data)
        public
        returns (bytes4)
        {
        uint256 _price = toUint256(_data);
        require(_price > 0);

        priceOf[_tokenId] = _price;
        sellerOf[_tokenId] = _seller;
        emit Listed(_seller, _tokenId, _price);

        return ERC721_RECEIVED;
    }

    /**
      * @dev Determine whether an item is listed
      * @param _tokenId The id of the good to check
      * @return Return true if item is listed
      */
    function isListed(uint256 _tokenId) public view returns (bool) {
        return sellerOf[_tokenId] != address(0);
    }

    /**
      * @dev Convert a 32 byte array to uint256
      * @param input 32 byte array
      */
    function toUint256(bytes input) internal pure returns (uint256) {
        uint256 converted;
        uint256 digit;
        for (uint256 index = 0; index < 32; index++) {
            digit = uint256(input[31 - index]);
            converted += digit * 256**index;
        }
        return converted;
    }

    /**
      * @dev Convenience function to remove tokens from listing
      * @param _tokenId the token to remove
      */
    function removeListing(uint256 _tokenId) internal {
        delete priceOf[_tokenId];
        delete sellerOf[_tokenId];
    }
}
