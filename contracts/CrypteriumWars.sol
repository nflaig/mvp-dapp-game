pragma solidity ^0.4.24;


import "./ERC721.sol";
import "./Ownable.sol";
import "./SafeMath.sol";

contract CrypteriumWars is ERC721, Ownable {

    using SafeMath for uint256;

    //--------------------------------------------------------------------------
    // Events
    //--------------------------------------------------------------------------
    event NewCommander(string _name, address indexed _owner);
    event HarvestCrypterium(uint _amount, address indexed _owner, uint _id);
    event ProduceInfantry(uint _amount, address indexed _owner, uint _id);
    event ProduceVehicle(uint _amount, address indexed _owner, uint _id);
    event ProduceAircraft(uint _amount, address indexed _owner, uint _id);
    event AttackerWon(address indexed _attacker, uint _attackMultiplier, address indexed _defender, uint _defenseMultiplier);
    event DefenderWon(address indexed _attacker, uint _attackMultiplier, address indexed _defender, uint _defenseMultiplier);

    //--------------------------------------------------------------------------
    // Variables
    //--------------------------------------------------------------------------
    uint constant harvestCooldownTime = 1 days;
    uint constant crypteriumPrice = 0.0001 ether;

    uint constant attackCooldownTime = 1 days;
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

    struct Commander {
        string name;
        address owner;

        uint crypterium;
        uint harvestReadyTime;

        uint infantryCount;
        uint vehicleCount;
        uint aircraftCount;

        uint attackReadyTime;
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

    modifier hasCrypterium(uint _amount) {
        require(_amount <= commanders[addressToCommander[msg.sender] - 1].crypterium);
        _;
    }

    modifier canAttack() {
        require(commanders[addressToCommander[msg.sender] - 1].attackReadyTime <= now);
        _;
    }

    modifier canHarvest() {
        require(commanders[addressToCommander[msg.sender] - 1].harvestReadyTime <= now);
        _;
    }

    //--------------------------------------------------------------------------
    // Getter
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

    //--------------------------------------------------------------------------
    // Function to create new Commander
    //--------------------------------------------------------------------------
    function createCommander(string _name) external {
        require(addressToCommander[msg.sender] == 0);
        uint id = commanders.push(Commander(_name, msg.sender, 0, now, 0, 0, 0, now));
        addressToCommander[msg.sender] = id;
        emit NewCommander(_name, msg.sender);
    }

    //--------------------------------------------------------------------------
    // Functions to harvest or buy Crypterium
    //--------------------------------------------------------------------------
    function harvestCrypterium() external hasCommander canHarvest {
        uint id = addressToCommander[msg.sender];
        Commander storage commander = commanders[id - 1];
        commander.harvestReadyTime = now + harvestCooldownTime;
        commander.crypterium = commander.crypterium.add(10);

        emit HarvestCrypterium(10, commander.owner, id - 1);
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
        uint defenseMultiplier = (101 - attackMultiplier) + defenderAdvantage;

        uint totalAttackPower = commander.infantryCount * infantryAttackPower
                                + commander.vehicleCount * vehicleAttackPower
                                + commander.aircraftCount * aircraftAttackPower;

        uint totalDefensePower = enemyCommander.infantryCount * infantryDefensePower
                                 + enemyCommander.vehicleCount * vehicleDefensePower
                                 + enemyCommander.aircraftCount * aircraftDefensePower;

        if ((totalAttackPower * attackMultiplier) > (totalDefensePower * defenseMultiplier)) {
            enemyCommander.crypterium = enemyCommander.crypterium.sub(_amount);
            commander.crypterium = commander.crypterium.add(_amount);
            commander.attackReadyTime = now + attackCooldownTime;

            emit AttackerWon(msg.sender, attackMultiplier, _address, defenseMultiplier);
        } else {
            commander.crypterium = commander.crypterium.sub(_amount);
            enemyCommander.crypterium = enemyCommander.crypterium.add(_amount);
            commander.attackReadyTime = now + attackCooldownTime;

            emit DefenderWon(msg.sender, attackMultiplier, _address, defenseMultiplier);
        }
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
        require(addressToCommander[msg.sender] == _tokenId.add(1) && msg.sender == commanders[_tokenId].owner && addressToCommander[_to] == 0);
        _transfer(msg.sender, _to, _tokenId);
    }

    function approve(address _to, uint256 _tokenId) external hasCommander {
        require(addressToCommander[msg.sender] == _tokenId.add(1) && msg.sender == commanders[_tokenId].owner && addressToCommander[_to] == 0);
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
