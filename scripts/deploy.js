const hre = require("hardhat");

async function main() {
  const MetaNestWallet = await hre.ethers.getContractFactory("MetaNestWallet");
  const wallet = await MetaNestWallet.deploy();
  await wallet.deployed();
  console.log("MetaNestWallet deployed to:", wallet.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

