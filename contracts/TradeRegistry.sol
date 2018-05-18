pragma solidity ^0.4.23;

import "./Trade.sol";


/**
  * @title TradeRegistry keeps track of ongoing trades
  */
contract TradeRegistry {

    event TradeAdded(address indexed _trade);

    mapping(address => uint256) tradeIndex;
    address[] trades;

    function numTrades() external view returns (uint256) {
        return trades.length;
    }

    function add(address trade) external {
        trades.push(trade);

        emit TradeAdded(trade);
    }
}
