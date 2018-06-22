pragma solidity ^0.4.22;

import "zeppelin-solidity/contracts/token/ERC827/ERC827Token.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";


/**
 * @title AsobiCoin is the MintableToken implementation for testing AsobiCoin
 */
contract AsobiCoin is ERC827Token, MintableToken {
    string public name = "ASOBI COIN";
    string public symbol = "ASC";
    uint256 public decimals = 18;
}
