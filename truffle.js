module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      gas: 6500000,
      network_id: "*"
    },
    ropsten: {
        provider: function() {
            var HDWalletProvider = require("truffle-hdwallet-provider");
            var infura_api_key = "1fb318e1115d4e43a6a33ea4a9236514";
            var mnemonic = "<REPLACE THIS WITH YOUR METAMASK SEED WORDS>";
            return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/" + infura_api_key);
        },
        gas: 4500000,
        network_id: '3'
    }
  },
  solc: {
     optimizer: {
       enabled: true,
       runs: 200
     }
  }
};
