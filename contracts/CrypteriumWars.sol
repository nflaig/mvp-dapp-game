pragma solidity ^0.4.24;

import "./ERC721.sol";
import "./Ownable.sol";
import "./SafeMath.sol";

contract CrypteriumWars is ERC721, Ownable {

    using SafeMath for uint256;

    //--------------------------------------------------------------------------
    // Events
    //--------------------------------------------------------------------------
    event NewCommander(string _name, address indexed _owner, uint _id);
    event ChangeName(string _oldName, string _newName, address indexed _owner, uint id);
    event HarvestCrypterium(uint _amount, address indexed _owner, uint _id);
    event ProduceInfantry(uint _amount, address indexed _owner, uint _id);
    event ProduceVehicle(uint _amount, address indexed _owner, uint _id);
    event ProduceAircraft(uint _amount, address indexed _owner, uint _id);
    event AttackerWon(
        address indexed _attacker,
        uint _attackMultiplier,
        address indexed _defender,
        uint _defenseMultiplier,
        uint _amount
        );
    event DefenderWon(
        address indexed _attacker,
        uint _attackMultiplier,
        address indexed _defender,
        uint _defenseMultiplier,
        uint _amount
        );
    event MissionSucceeded(
        uint _missionLevel,
        uint _difficultyMultiplier,
        uint _totalPowerMultiplier,
        uint _reward,
        address indexed _owner,
        uint _id
        );
    event MissionFailed(
        uint _missionLevel,
        uint _difficultyMultiplier,
        uint _totalPowerMultiplier,
        address indexed _owner,
        uint _id
        );
    event SpecialMissionCompleted(address indexed _owner, uint _id);

    //--------------------------------------------------------------------------
    // Variables
    //--------------------------------------------------------------------------
    uint constant harvestCooldownTime = 1 hours;
    uint constant harvestAmount = 10;
    uint constant crypteriumPrice = 0.001 ether;

    uint constant attackCooldownTime = 1 hours;
    uint constant defenderAdvantage = 30;

    uint private nonce = 0;

    uint constant infantryCost = 2;
    uint constant infantryAttackPower = 1;
    uint constant infantryDefensePower = 1;

    uint constant vehicleCost = 10;
    uint constant vehicleAttackPower = 4;
    uint constant vehicleDefensePower = 6;

    uint constant aircraftCost = 20;
    uint constant aircraftAttackPower = 12;
    uint constant aircraftDefensePower = 8;

    uint constant missionCooldownTime = 1 hours;
    uint constant missionDifficulty = 20;
    uint constant missionReward = 10;

    uint constant specialMissionReward = 1000;

    struct Commander {
        string name;
        address owner;

        uint crypterium;
        uint harvestReadyTime;

        uint infantryCount;
        uint vehicleCount;
        uint aircraftCount;

        uint attackReadyTime;

        uint missionLevel;
        uint missionReadyTime;

        bool completedSpecialMission;
    }

    Commander[] public commanders;

    mapping (address => uint) public addressToCommander;

    //--------------------------------------------------------------------------
    // Modifiers
    //--------------------------------------------------------------------------
    modifier hasCommander() {
        require(addressToCommander[msg.sender] != 0);
        _;
    }

    modifier canHarvest() {
        require(commanders[addressToCommander[msg.sender] - 1].harvestReadyTime <= now);
        _;
    }

    modifier hasCrypterium(uint _amount) {
        require(_amount <= commanders[addressToCommander[msg.sender] - 1].crypterium);
        _;
    }

    modifier canAttack() {
        require(commanders[addressToCommander[msg.sender] - 1].attackReadyTime <= now);
        _;
    }

    modifier canStartMission() {
        require(commanders[addressToCommander[msg.sender] - 1].missionReadyTime <= now);
        _;
    }

    //--------------------------------------------------------------------------
    // Getters
    //--------------------------------------------------------------------------
    function getCommanderName(uint _id) external view returns (string) {
        return commanders[_id].name;
    }

    function getCommanderDetails(uint _id) external view returns (
        address, uint, uint, uint, uint, uint, uint
        ) {
        return (
            commanders[_id].owner,commanders[_id].crypterium,
            commanders[_id].harvestReadyTime, commanders[_id].infantryCount,
            commanders[_id].vehicleCount, commanders[_id].aircraftCount,
            commanders[_id].attackReadyTime
            );
    }

    function getCommanderCount() external view returns (uint) {
        return commanders.length;
    }

    function getCommanderId(address _address) external view returns (uint) {
        return addressToCommander[_address];
    }

    function getMissionDetails(uint _id) external view returns (uint, uint) {
        return (commanders[_id].missionLevel, commanders[_id].missionReadyTime);
    }

    //--------------------------------------------------------------------------
    // Functions to create/edit Commander
    //--------------------------------------------------------------------------
    function createCommander(string _name) external {
        require(addressToCommander[msg.sender] == 0);
        uint id = commanders.push(Commander(_name, msg.sender, 0, now, 0, 0, 0, now, 1, now, false));
        addressToCommander[msg.sender] = id;
        emit NewCommander(_name, msg.sender, id - 1);
    }

    function changeCommanderName(string _newName) external hasCommander {
        uint id = addressToCommander[msg.sender];
        Commander storage commander = commanders[id - 1];
        string memory oldName = commander.name;
        commander.name = _newName;

        emit ChangeName(oldName, _newName, msg.sender, id - 1);
    }

    //--------------------------------------------------------------------------
    // Functions to harvest or buy Crypterium
    //--------------------------------------------------------------------------
    function harvestCrypterium() external hasCommander canHarvest {
        uint id = addressToCommander[msg.sender];
        Commander storage commander = commanders[id - 1];
        commander.harvestReadyTime = now.add(harvestCooldownTime);
        commander.crypterium = commander.crypterium.add(harvestAmount);

        emit HarvestCrypterium(harvestAmount, commander.owner, id - 1);
    }

    function buyCrypterium(uint _amount) external payable hasCommander {
        require(msg.value == (_amount.mul(crypteriumPrice)));

        uint id = addressToCommander[msg.sender];
        Commander storage commander = commanders[id - 1];

        commander.crypterium = commander.crypterium.add(_amount);

        emit HarvestCrypterium(_amount, commander.owner, id - 1);
    }

    //--------------------------------------------------------------------------
    // Functions to produce units
    //--------------------------------------------------------------------------
    function produceInfantry(uint _amount) external hasCommander hasCrypterium(infantryCost.mul(_amount)) {
        uint id = addressToCommander[msg.sender];
        Commander storage commander = commanders[id - 1];

        commander.crypterium = commander.crypterium.sub(infantryCost.mul(_amount));
        commander.infantryCount = commander.infantryCount.add(_amount);

        emit ProduceInfantry(_amount, commander.owner, id - 1);
    }

    function produceVehicle(uint _amount) external hasCommander hasCrypterium(vehicleCost.mul(_amount)) {
        uint id = addressToCommander[msg.sender];
        Commander storage commander = commanders[id - 1];

        commander.crypterium = commander.crypterium.sub(vehicleCost.mul(_amount));
        commander.vehicleCount = commander.vehicleCount.add(_amount);

        emit ProduceVehicle(_amount, commander.owner, id - 1);
    }

    function produceAircraft(uint _amount) external hasCommander hasCrypterium(aircraftCost.mul(_amount)) {
        uint id = addressToCommander[msg.sender];
        Commander storage commander = commanders[id - 1];

        commander.crypterium = commander.crypterium.sub(aircraftCost.mul(_amount));
        commander.aircraftCount = commander.aircraftCount.add(_amount);

        emit ProduceAircraft(_amount, commander.owner, id - 1);
    }

    //--------------------------------------------------------------------------
    // Function to attack other Commanders
    //--------------------------------------------------------------------------
    function attack(address _address, uint _amount) external hasCommander canAttack hasCrypterium(_amount) {
        require(msg.sender != _address && addressToCommander[_address] != 0);

        Commander storage enemyCommander = commanders[addressToCommander[_address] - 1];

        require(enemyCommander.crypterium >= _amount);

        uint id = addressToCommander[msg.sender] - 1;
        Commander storage commander = commanders[id];

        // Note: this is not a secure way to generate randomness
        nonce++;
        uint attackMultiplier = (uint(keccak256(abi.encodePacked(now, msg.sender, nonce))) % 100) + 1;
        uint defenseMultiplier = (100 - attackMultiplier) + defenderAdvantage;

        uint totalAttackPower = commander.infantryCount * infantryAttackPower
                                + commander.vehicleCount * vehicleAttackPower
                                + commander.aircraftCount * aircraftAttackPower;

        uint totalDefensePower = enemyCommander.infantryCount * infantryDefensePower
                                 + enemyCommander.vehicleCount * vehicleDefensePower
                                 + enemyCommander.aircraftCount * aircraftDefensePower;

        if ((totalAttackPower * attackMultiplier) > (totalDefensePower * defenseMultiplier)) {
            enemyCommander.crypterium = enemyCommander.crypterium.sub(_amount);
            commander.crypterium = commander.crypterium.add(_amount);
            commander.attackReadyTime = now.add(attackCooldownTime);

            emit AttackerWon(msg.sender, attackMultiplier, _address, defenseMultiplier, _amount);
        } else {
            commander.crypterium = commander.crypterium.sub(_amount);
            enemyCommander.crypterium = enemyCommander.crypterium.add(_amount);
            commander.attackReadyTime = now.add(attackCooldownTime);

            emit DefenderWon(msg.sender, attackMultiplier, _address, defenseMultiplier, _amount);
        }
    }

    //--------------------------------------------------------------------------
    // Function to start a mission
    //--------------------------------------------------------------------------
    function startMission() external hasCommander canStartMission {
        uint id = addressToCommander[msg.sender];
        Commander storage commander = commanders[id - 1];

        // Note: this is not a secure way to generate randomness
        nonce++;
        uint totalPowerMultiplier = (uint(keccak256(abi.encodePacked(now, msg.sender, nonce))) % 100) + 1;
        uint difficultyMultiplier = (100 - totalPowerMultiplier);


        uint totalPower = commander.infantryCount * infantryAttackPower
                          + commander.vehicleCount * vehicleAttackPower
                          + commander.aircraftCount * aircraftAttackPower
                          + commander.infantryCount * infantryDefensePower
                          + commander.vehicleCount * vehicleDefensePower
                          + commander.aircraftCount * aircraftDefensePower;

        uint difficulty = commander.missionLevel * missionDifficulty;

        if ((totalPower * totalPowerMultiplier) > (difficulty * difficultyMultiplier)) {
            uint reward = commander.missionLevel * missionReward;
            commander.crypterium = commander.crypterium.add(reward);
            commander.missionReadyTime = now.add(missionCooldownTime);
            commander.missionLevel += 1;

            emit MissionSucceeded(
                commander.missionLevel - 1,
                difficultyMultiplier,
                totalPowerMultiplier,
                reward,
                commander.owner,
                id - 1
                );
        } else {
            commander.missionReadyTime = now.add(missionCooldownTime);

            emit MissionFailed(
                commander.missionLevel,
                difficultyMultiplier,
                totalPowerMultiplier,
                commander.owner,
                id - 1
                );
        }
    }

    //--------------------------------------------------------------------------
    // Function to start special mission
    // Note: Some stages are similar to the gates in theCyberGatekeeperTwo
    //--------------------------------------------------------------------------
    function startSpecialMission(uint _commandOne, bytes8 _commandTwo) external {
        // Stage 1
        require(addressToCommander[tx.origin] != 0);
        require(commanders[addressToCommander[tx.origin] - 1].completedSpecialMission == false);
        require(msg.sender != tx.origin);

        // Stage 2
        uint secretNumber =  (uint(keccak256(abi.encodePacked(now, msg.sender))) % 100) + 1;
        require(secretNumber == _commandOne);

        // Stage 3
        uint callerSize;
        assembly { callerSize := extcodesize(caller) }
        require(callerSize == 0);

        // Stage 4
        require(uint64(keccak256(abi.encodePacked(_commandOne, msg.sender))) ^ uint64(_commandTwo) == uint64(0) - 1);

        // Get reward after completing all stages
        uint id = addressToCommander[tx.origin];
        Commander storage commander = commanders[id - 1];

        commander.completedSpecialMission = true;
        commander.crypterium = commander.crypterium.add(specialMissionReward);

        emit SpecialMissionCompleted(commander.owner, id - 1);
    }

    //--------------------------------------------------------------------------
    // ERC-721 functions
    //--------------------------------------------------------------------------
    mapping (uint => address) approvals;

    function balanceOf(address _owner) external view returns (uint256 _balance) {
        if (addressToCommander[_owner] == 0) {
            return 0;
        } else {
            return 1;
        }
    }

    function ownerOf(uint256 _tokenId) external view returns (address _owner) {
        return commanders[_tokenId].owner;
    }

    function _transfer(address _from, address _to, uint256 _tokenId) private {
        addressToCommander[_from] = 0;
        addressToCommander[_to] = _tokenId.add(1);
        commanders[_tokenId].owner = _to;

        emit Transfer(_from, _to, _tokenId);
    }

    function transfer(address _to, uint256 _tokenId) external hasCommander {
        require(
            addressToCommander[msg.sender] == _tokenId.add(1) &&
            msg.sender == commanders[_tokenId].owner &&
            addressToCommander[_to] == 0
            );
        _transfer(msg.sender, _to, _tokenId);
    }

    function approve(address _to, uint256 _tokenId) external hasCommander {
        require(
            addressToCommander[msg.sender] == _tokenId.add(1) &&
            msg.sender == commanders[_tokenId].owner &&
            addressToCommander[_to] == 0
            );
        approvals[_tokenId] = _to;

        emit Approval(msg.sender, _to, _tokenId);
    }

    function takeOwnership(uint256 _tokenId) external {
        require(approvals[_tokenId] == msg.sender && addressToCommander[msg.sender] == 0);
        address owner = commanders[_tokenId].owner;
        _transfer(owner, msg.sender, _tokenId);
    }

    //--------------------------------------------------------------------------
    // Fallback function
    //--------------------------------------------------------------------------
    function () public payable {}

    //--------------------------------------------------------------------------
    // Only owner functions
    //--------------------------------------------------------------------------
    function withdraw(uint _amount) public onlyOwner {
        require(_amount <= address(this).balance);
        owner.transfer(_amount);
    }

    function withdrawAll() public onlyOwner {
        owner.transfer(address(this).balance);
    }
}
