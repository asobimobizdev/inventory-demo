pragma solidity ^0.4.23;

import "contracts/Goods.sol";


contract Trade {

    address[] public traders;

    Goods goods;

    mapping(address => uint256[]) offers;

    constructor(Goods _goods, address[] _traders) public {
        goods = _goods;
        traders = _traders;
    }

    function numTraders() public view returns (uint256) {
        return traders.length;
    }
}
