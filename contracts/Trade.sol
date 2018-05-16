pragma solidity ^0.4.23;

import "contracts/Goods.sol";


contract Trade {

    address public playerA;
    address public playerB;

    Goods goods;

    constructor(Goods _goods, address _playerA, address _playerB) public {
        goods = _goods;
        playerA = _playerA;
        playerB = _playerB;
    }
}
