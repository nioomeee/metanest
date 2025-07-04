require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");

module.exports = {
  solidity: "0.8.20",
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  networks: {
    mumbai: {
      url: process.env.MUMBAI_RPC,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};