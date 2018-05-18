pragma solidity ^0.4.23;

import "./Trade.sol";


/**
  * @title TradeRegistry keeps track of ongoing trades
  */
contract TradeRegistry {

    event TradeAdded(address indexed _trade);

    mapping(address => uint256) tradeIndex;
    address[] trades;

    /**
      * @dev Return the number of trades
      * @return Return the number of trades
      */
    function numTrades() external view returns (uint256) {
        return trades.length;
    }

    /**
      * @dev Add a trade
      * @dev Can only be added by the traders
      * @param tradeAddress Address of the trade
      */
    function add(address tradeAddress) external {
        Trade trade = Trade(tradeAddress);

        require(trade.isTrader(msg.sender));

        trades.push(tradeAddress);

        emit TradeAdded(tradeAddress);
    }
}
