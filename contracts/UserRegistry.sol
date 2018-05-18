pragma solidity ^0.4.23;


contract UserRegistry {
    event UserAdded(address indexed _user);
    event UserRemoved(address indexed _user);

    mapping(address => bool) public isUser;

    address[] users;
    mapping(address => uint256) userIndex;

    function add() external {
        userIndex[msg.sender] = users.length;
        users.push(msg.sender);
        isUser[msg.sender] = true;

        emit UserAdded(msg.sender);
    }

    function remove() external {
        require(isUser[msg.sender]);

        isUser[msg.sender] = false;

        users[userIndex[msg.sender]] = users[users.length - 1];
        users.length--;

        emit UserRemoved(msg.sender);
    }

    function numUsers() external view returns (uint256) {
        return users.length;
    }
}
