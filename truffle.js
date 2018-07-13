module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      gas: 6500000,
      network_id: "*"
    }
  },
  solc: {
     optimizer: {
       enabled: true,
       runs: 200
     }
  }
};
