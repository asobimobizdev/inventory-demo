pragma solidity ^0.4.23;

import "contracts/Goods.sol";


contract Trade {

    event GoodAdded(address _trader, uint256 goodID);
    event GoodRemoved(address _trader, uint256 goodID);
    event GoodExchanged(address _from, address _to, uint256 goodID);
    event TradeAccepted(address _trader);
    event TradeWithdrawn(address _trader);
    event TradeFinalized();

    address[2] public traders;
    bool[2] public traderAccepted;

    Goods goods;

    uint256[][2] public traderGoods;
    mapping(uint256 => uint256) public traderGoodsIndex;

    constructor(Goods _goods, address[2] _traders) public {
        goods = _goods;
        traders = _traders;
    }

    modifier onlyTrader(address trader) {
        require(isTrader(trader));
        _;
    }

    function numTraders() external view returns (uint256) {
        return traders.length;
    }

    function numTraderGoods(address trader) external view returns (uint256) {
        return _numTraderGoods(_traderIndex(trader));
    }

    function numTradersAccepted() external view returns (uint256) {
        if (isFinal()) {
            return 2;
        }
        if (traderAccepted[0] || traderAccepted[1]) {
            return 1;
        }
        return 0;
    }

    function traderGoodByIndex(address trader, uint256 index)
    onlyTrader(trader) external view returns (uint256) {
        return traderGoods[_traderIndex(trader)][index];
    }

    function isFinal() public view returns (bool) {
        if (!traderAccepted[0]) {
            return false;
        }
        if (!traderAccepted[1]) {
            return false;
        }
        return true;
    }

    function numGoods() public view returns (uint256) {
        return traderGoods[0].length + traderGoods[1].length;
    }

    function isTrader(address trader) public view returns (bool) {
        return trader == traders[0] || trader == traders[1];
    }

    function accept() onlyTrader(msg.sender) external {
        uint256 traderIndex = _traderIndex(msg.sender);
        require(traderAccepted[traderIndex] == false);

        traderAccepted[traderIndex] = true;

        emit TradeAccepted(msg.sender);
    }

    function withdraw() onlyTrader(msg.sender) external {
        uint256 traderIndex = _traderIndex(msg.sender);
        require(traderAccepted[traderIndex]);
        require(!isFinal());

        traderAccepted[traderIndex] = false;
        emit TradeWithdrawn(msg.sender);
    }

    function addGood(uint256 goodID) onlyTrader(msg.sender) external {
        address trader = msg.sender;
        require(goods.ownerOf(goodID) == trader);

        uint256 traderIndex = _traderIndex(trader);
        traderGoodsIndex[goodID] = traderGoods[traderIndex].length;
        traderGoods[traderIndex].push(goodID);

        emit GoodAdded(trader, goodID);
    }

    function removeGood(uint256 goodID) onlyTrader(msg.sender) external {
        address trader = msg.sender;
        require(goods.ownerOf(goodID) == trader);

        uint256 goodsIndex = traderGoodsIndex[goodID];
        uint256 traderIndex = _traderIndex(trader);

        for (uint256 i = goodsIndex; i < traderGoods[traderIndex].length - 1; i++) {
            traderGoods[traderIndex][i] = traderGoods[traderIndex][i + 1];
        }
        traderGoods[traderIndex].length--;

        emit GoodRemoved(trader, goodID);
    }

    function exchange() external {
        require(isFinal());

        for(uint256 ownerIndex = 0; ownerIndex < traders.length; ownerIndex++) {
            address owner = traders[ownerIndex];
            uint256 receiverIndex = (traders.length - 1) - ownerIndex;
            address receiver = traders[receiverIndex];
            uint256 numGoods = _numTraderGoods(ownerIndex);
            for(uint256 goodIndex = 0; goodIndex < numGoods; goodIndex++) {
                uint256 goodID = traderGoods[ownerIndex][goodIndex];
                goods.transferFrom(owner, receiver, goodID);
                emit GoodExchanged(owner, receiver, goodID);
            }
        }
    }

    function _numTraderGoods(uint256 _index) internal view returns (uint256) {
        return traderGoods[_index].length;
    }

    function _traderIndex(address trader)
    onlyTrader(trader) internal view returns (uint256) {
        if (trader == traders[0]) {
            return 0;
        } else {
            return 1;
        }
    }
}
