pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol";

import "contracts/Goods.sol";


/**
  * @title Trade contract that allows atomic exchange of multiple goods
  * @dev Only two trading parties are supported
  */
contract Trade is ERC721Receiver {
    event GoodAdded(address indexed _trader, uint256 _goodID);
    event GoodRemoved(address indexed _trader, uint256 _goodID);
    event GoodExchanged(
        address indexed _from,
        address indexed _to,
        uint256 indexed _goodID
    );
    event TradeAccepted(address indexed _trader);
    event TradeWithdrawn(address indexed _trader);
    event TradeCancelled(address indexed _trader);
    event TradeFinalized();
    event ExchangeFinished();


    address[2] public traders;
    mapping(address => bool) public traderAccepted;

    Goods goods;
    bool public isActive = true;

    mapping(uint256 => address) public goodsTrader;

    constructor(Goods _goods, address[2] _traders) public {
        goods = _goods;
        traders = _traders;
    }

    modifier activeOnly() {
        require(isActive);
        _;
    }

    modifier traderOnly() {
        require(isTrader(msg.sender));
        _;
    }
    /**
      * @dev Return the total numbers of traders
      * @return Number of traders
      */
    function numTraders() external view returns (uint256) {
        return traders.length;
    }

    /**
      * @dev Return the number of traders that have accepted this trade
      * @return Number of traders that accepted
      */
    function numTradersAccepted() external view returns (uint256) {
        return _numTradersAccepted();
    }

    /**
      * @dev Accept the trade
      * @dev Can only be called by a trader
      */
    function accept() activeOnly() traderOnly() external {
        require(traderAccepted[msg.sender] == false);

        traderAccepted[msg.sender] = true;

        emit TradeAccepted(msg.sender);
        if (isFinal()) {
            emit TradeFinalized();
        }
    }

    /**
      * @dev Withdraw trade acceptance
      * @dev Can only be called by a trader
      */
    function withdraw() activeOnly() traderOnly() external {
        require(traderAccepted[msg.sender]);
        require(!isFinal());

        traderAccepted[msg.sender] = false;
        emit TradeWithdrawn(msg.sender);
    }

    /**
      * @dev Cancel a trade
      * @dev Can only be called by a trader
      * @dev Will throw if the trader accepted
      */
    function cancel() activeOnly() traderOnly() external {
        require(!traderAccepted[msg.sender]);

        isActive = false;
        emit TradeCancelled(msg.sender);
    }

    /**
      * @dev Remove a good that was added to the trade
      * @dev Can only be called by a trader
      * @param goodID the good ID to remove
      */
    function removeGood(uint256 goodID) activeOnly() traderOnly() external {
        address trader = msg.sender;
        require(!isFinal());
        require(goodsTrader[goodID] == trader);

        goods.safeTransferFrom(address(this), trader, goodID);

        emit GoodRemoved(trader, goodID);
    }

    /**
      * @dev Retrieve the goods after the trade is finalized
      * @dev Can only be called by a trader
      */
    function getGoods() activeOnly() traderOnly() external {
        require(isFinal());
        uint256 balance = goods.balanceOf(address(this));
        // We need to keep record how many goods we skipped because they
        // are not supposed to be transferred to one of the traders
        // It really feels like a hack, but it works.
        // XXX HACK Justus 2018-05-17
        uint256 goodsSkipped = 0;

        for (uint256 goodIndex = 0; goodIndex < balance; goodIndex++) {
            uint256 goodID = goods.tokenOfOwnerByIndex(
                address(this),
                goodsSkipped
            );
            if (goodsTrader[goodID] == msg.sender) {
                goodsSkipped++;
                continue;
            }
            goods.safeTransferFrom(address(this), msg.sender, goodID);
        }
        emit ExchangeFinished();
    }

    /**
      * @dev Query the trade state
      * @return Return true if the trade is finalized
      */
    function isFinal() public view returns (bool) {
        return _numTradersAccepted() == 2;
    }

    /**
      * @dev Query the trader state of a given address
      * @return Return true if the trade is finalized
      */
    function isTrader(address trader) public view returns (bool) {
        return trader == traders[0] || trader == traders[1];
    }

    /**
      * @dev Handle ERC721 token reception
      * @param from The address of the token sender
      * @param goodID The good that was sent
      * @param data Data attachment
      * @return Return some complicated keccak thing if everything worked
      */
    function onERC721Received(address from, uint256 goodID, bytes data)
        activeOnly()
        public returns (bytes4)
        {
        // We can't verify msg.sender here because the call is coming from
        // the goods contract
        require(msg.sender == address(goods));
        require(isTrader(from));
        require(!isFinal());

        goodsTrader[goodID] = from;

        emit GoodAdded(from, goodID);

        return ERC721_RECEIVED;
    }

    /**
      * @dev Return the number of traders that have accepted this trade
      * @return Return the number of traders that have accepted this trade
      */
    function _numTradersAccepted() internal view returns (uint256) {
        if (traderAccepted[traders[0]] && traderAccepted[traders[1]]) {
            return 2;
        }
        if (traderAccepted[traders[0]] || traderAccepted[traders[1]]) {
            return 1;
        }
        return 0;
    }
}
