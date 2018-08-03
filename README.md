# Crypterium Wars

Crypterium Wars is a Decentralized Application (Dapp) Game developed on Ethereum.
It benefits from a lot of features that a blockchain offers, namely, high security,
censorship resistance and a 100% ownership of the assets in the game by the player.
Whereas the cost and the delay of each transaction barely affect the game and therefore,
the advantages of using a blockchain outweigh the disadvantages.

#### About the Game

Each player can create a Commander which is associated with their Ethereum address.
A Commander is a non-fungible ERC-721 token that is indivisible and unique.
It is also possible to transfer a Commander to another address which does not already have one.
After creating a Commander, the player can harvest or buy Crypterium that can be used to produce different units.
Currently, there are infantry, vehicle and aircraft units each with unique combat stats.
A player can also attack other Commanders and fight for a certain amount of Crypterium.
Furthermore, there are missions which require a strong force of units depending on the mission level,
but the reward increases as well. For really dedicated players, there is a special mission that can only be
solved with some technical knowledge, but the reward will be worth the effort.

#### Further Improvements

The front-end of the game is currently just functional and can be improved with graphics and animations. For example,
production animations while building units and battle animations for missions and attacks on other players. The smart
contract can also be improved by adding new features or increasing the complexity of the current game logic.

## Installation

In order to run the game on your local machine some requirements need to be installed.

#### Node.js

First install `npm` which is distributed with Node.js.

https://nodejs.org/en/download/

#### Truffle

Truffle is a development environment, testing framework and
asset pipeline for Ethereum, aiming to make life as an Ethereum developer easier.
It can be used to compile, deploy and test smart contracts.

```
npm install -g truffle
```

#### Ganache CLI

Provides a local development blockchain server.

```
npm install -g ganache-cli
```

#### serve

Local development HTTP server needed to interact with the front-end of the game.

```
npm install -g serve
```

#### MetaMask

MetaMask is a browser extension that allows you to interact with the Ethereum blockchain.

https://metamask.io/

## Usage

These are the instructions to get the game up and running on your local blockchain.

#### Run local blockchain with your MetaMask accounts

```
ganache-cli -m "MetaMask Seed Words"
```

#### Enter project folder

```
cd mvp-dapp-game
```

#### Compile the contracts

```
truffle compile
```

#### Deploy/Migrate the contracts to your local blockchain

```
truffle migrate
```

#### Change the contract address

In order to use the front-end with your deployed contract you need to set the CrypteriumWars contract address in
[scripts/logic.js](https://github.com/nflaig/mvp-dapp-game/blob/master/scripts/logic.js#L4).

#### Run local HTTP server

```
serve
```

#### Open a browser with MetaMask installed

Set the network in your MetaMask to **Localhost 8545**.

#### Enter the following URL to access the front-end of the game

http://localhost:5000

#### Start playing the game

That's it. Now you can use the front-end to interact with the smart contract on your local blockchain
and sign transactions with MetaMask.

## License

Code released under the [MIT License](https://github.com/nflaig/mvp-dapp-game/blob/master/LICENSE).
