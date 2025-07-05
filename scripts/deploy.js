const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Starting MetaNest deployment...');

  // Get signers
  const [deployer, user1, user2, user3] = await ethers.getSigners();

  console.log('📋 Deploying contracts with address:', deployer.address);
  console.log(
    '💰 Deployer balance:',
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    'ETH'
  );

  // Deploy MockERC20 tokens
  console.log('\n🪙 Deploying test tokens...');

  const MockERC20 = await ethers.getContractFactory('MockERC20');

  // Deploy USDC-like token
  const usdcToken = await MockERC20.deploy(
    'USD Coin',
    'USDC',
    ethers.parseEther('1000000') // 1M USDC
  );
  await usdcToken.waitForDeployment();
  console.log('✅ USDC deployed to:', usdcToken.target);

  // Deploy DAI-like token
  const daiToken = await MockERC20.deploy(
    'Dai Stablecoin',
    'DAI',
    ethers.parseEther('1000000') // 1M DAI
  );
  await daiToken.waitForDeployment();
  console.log('✅ DAI deployed to:', daiToken.target);

  // Deploy MetaNestWallet
  console.log('\n👛 Deploying MetaNestWallet...');
  const MetaNestWallet = await ethers.getContractFactory('MetaNestWallet');
  const wallet = await MetaNestWallet.deploy();
  await wallet.waitForDeployment();
  console.log('✅ MetaNestWallet deployed to:', wallet.target);

  // Setup test wallets with initial balances
  console.log('\n🎁 Setting up test wallets...');

  // Transfer tokens to test users
  const initialBalance = ethers.parseEther('10000'); // 10k tokens each

  await usdcToken.transfer(user1.address, initialBalance);
  await usdcToken.transfer(user2.address, initialBalance);
  await usdcToken.transfer(user3.address, initialBalance);

  await daiToken.transfer(user1.address, initialBalance);
  await daiToken.transfer(user2.address, initialBalance);
  await daiToken.transfer(user3.address, initialBalance);

  // Send some ETH to test users
  const ethAmount = ethers.parseEther('10'); // 10 ETH each
  await deployer.sendTransaction({
    to: user1.address,
    value: ethAmount,
  });
  await deployer.sendTransaction({
    to: user2.address,
    value: ethAmount,
  });
  await deployer.sendTransaction({
    to: user3.address,
    value: ethAmount,
  });

  console.log('✅ Test wallets funded:');
  console.log(
    `   User 1 (${user1.address}): ${ethers.formatEther(
      initialBalance
    )} USDC, ${ethers.formatEther(initialBalance)} DAI, ${ethers.formatEther(
      ethAmount
    )} ETH`
  );
  console.log(
    `   User 2 (${user2.address}): ${ethers.formatEther(
      initialBalance
    )} USDC, ${ethers.formatEther(initialBalance)} DAI, ${ethers.formatEther(
      ethAmount
    )} ETH`
  );
  console.log(
    `   User 3 (${user3.address}): ${ethers.formatEther(
      initialBalance
    )} USDC, ${ethers.formatEther(initialBalance)} DAI, ${ethers.formatEther(
      ethAmount
    )} ETH`
  );

  // Add some test contacts
  console.log('\n👥 Setting up test contacts...');

  // User1 adds User2 and User3 as contacts
  await wallet.connect(user1).addContact(user2.address, 'Alice');
  await wallet.connect(user1).addContact(user3.address, 'Bob');

  // User2 adds User1 and User3 as contacts
  await wallet.connect(user2).addContact(user1.address, 'Charlie');
  await wallet.connect(user2).addContact(user3.address, 'David');

  // User3 adds User1 and User2 as contacts
  await wallet.connect(user3).addContact(user1.address, 'Eve');
  await wallet.connect(user3).addContact(user2.address, 'Frank');

  console.log('✅ Test contacts added');

  // Create deployment info
  const deploymentInfo = {
    network: 'localhost',
    chainId: 31337,
    contracts: {
      metaNestWallet: wallet.target,
      usdcToken: usdcToken.target,
      daiToken: daiToken.target,
    },
    testAccounts: {
      deployer: deployer.address,
      user1: user1.address,
      user2: user2.address,
      user3: user3.address,
    },
    deploymentTime: new Date().toISOString(),
  };

  console.log('\n Deployment Summary:');
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log('\n🎉 MetaNest deployment completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Start local node: npx hardhat node');
  console.log('2. Update frontend with contract addresses');
  console.log(
    '3. Test the application with MetaMask connected to localhost:8545'
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
