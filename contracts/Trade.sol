pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol";

import "contracts/Goods.sol";


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
    event TradeFinalized();
    event ExchangeFinished();


    address[2] public traders;
    mapping(address => bool) public traderAccepted;

    Goods goods;

    mapping(uint256 => address) public goodsTrader;

    constructor(Goods _goods, address[2] _traders) public {
        goods = _goods;
        traders = _traders;
    }

    modifier traderOnly() {
        require(isTrader(msg.sender));
        _;
    }

    function numTradersAccepted() external view returns (uint256) {
        return _numTradersAccepted();
    }

    function accept() traderOnly() external {
        require(traderAccepted[msg.sender] == false);

        traderAccepted[msg.sender] = true;

        emit TradeAccepted(msg.sender);
        if (isFinal()) {
            emit TradeFinalized();
        }
    }

    function withdraw() traderOnly() external {
        require(traderAccepted[msg.sender]);
        require(!isFinal());

        traderAccepted[msg.sender] = false;
        emit TradeWithdrawn(msg.sender);
    }

    function removeGood(uint256 goodID) external {
        address trader = msg.sender;
        require(!isFinal());
        require(goodsTrader[goodID] == trader);

        goods.safeTransferFrom(address(this), trader, goodID);

        emit GoodRemoved(trader, goodID);
    }

    function getGoods() traderOnly() external {
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

    function isFinal() public view returns (bool) {
        return _numTradersAccepted() == 2;
    }

    function isTrader(address trader) public view returns (bool) {
        return trader == traders[0] || trader == traders[1];
    }

    function onERC721Received(address from, uint256 goodID, bytes data)
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
