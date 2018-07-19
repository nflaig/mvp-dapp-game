# Crypterium Wars

Crypterium Wars is a Decentralized Application (Dapp) Game developed on Ethereum.
Each player can create a Commander which is associated with their Ethereum address.
A Commander is a non-fungible ERC-721 token that is indivisible and unique.
It is also possible to transfer a Commander to another address which does not already have one.
After creating a Commander, the player can harvest or buy Crypterium that can be used to produce different units.
Currently, there are infantry, vehicle and aircraft units each with unique combat stats.
A player can also attack other Commanders and fight for a certain amount of Crypterium.

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
[js/logic.js](https://github.com/nflaig/mvp-dapp-game/blob/master/js/logic.js#L4).

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
