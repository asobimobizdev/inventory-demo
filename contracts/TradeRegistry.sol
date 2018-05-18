pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/math/SafeMath.sol";

import "./Trade.sol";


/**
  * @title TradeRegistry keeps track of ongoing trades
  */
contract TradeRegistry {

    event TradeAdded(address indexed _trade);
    event TradeRemoved(address indexed _trade);

    mapping(address => address) traderTrade;
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
        for (uint256 i = 0; i < trade.numTraders(); i++) {
            address trader = trade.traders(i);
            require(traderTrade[trader] == address(0));
            traderTrade[trader] = tradeAddress;
        }

        emit TradeAdded(tradeAddress);
    }

    /**
      * @dev Remove a trade
      * @dev Throws if no trade exists
      */
    function remove() external {
        address tradeAddress = traderTrade[msg.sender];
        require(tradeAddress != address(0));

        Trade trade = Trade(tradeAddress);
        require(trade.isFinal());

        for (uint256 i = 0; i < trade.numTraders(); i++) {
            address trader = trade.traders(i);
            traderTrade[trader] = address(0);
        }

        trades[tradeIndex[trade]] = trades[SafeMath.sub(trades.length, 1)];
        trades.length--;

        emit TradeRemoved(tradeAddress);
    }
}
