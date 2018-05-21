pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/math/SafeMath.sol";


/**
  * @title UserRegistry keeps track of users
  */
contract UserRegistry {
    event UserAdded(address indexed _user);
    event UserRemoved(address indexed _user);

    mapping(address => bool) public isUser;
    mapping(address => string) public userName;

    address[] public users;
    mapping(address => uint256) userIndex;

    /**
      * @dev Allow a user to add themselves
      */
    function add(string name) external {
        userIndex[msg.sender] = users.length;
        users.push(msg.sender);
        isUser[msg.sender] = true;
        userName[msg.sender] = name;

        emit UserAdded(msg.sender);
    }

    /**
      * @dev Allow a user that is already added to remove themselves
      */
    function remove() external {
        require(isUser[msg.sender]);

        isUser[msg.sender] = false;
        delete userName[msg.sender];

        users[userIndex[msg.sender]] = users[SafeMath.sub(users.length, 1)];
        users.length--;

        emit UserRemoved(msg.sender);
    }

    /**
      * @dev Return the number of users that are in this registry
      * @return Return the number of users that are in this registry
      */
    function numUsers() external view returns (uint256) {
        return users.length;
    }
}
