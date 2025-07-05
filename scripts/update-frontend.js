const fs = require('fs');
const path = require('path');

// Read deployment info from a file (you can modify this to read from console output)
function updateContractAddresses() {
  console.log('🔄 Updating frontend contract addresses...');

  // This is a placeholder - in a real scenario, you'd read this from deployment output
  // For now, we'll use the default Hardhat addresses
  const deploymentInfo = {
    contracts: {
      metaNestWallet: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      usdcToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      daiToken: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    },
  };

  const contractsFilePath = path.join(
    __dirname,
    '../MetaNest-Application/lib/contracts.ts'
  );

  try {
    let contractsContent = fs.readFileSync(contractsFilePath, 'utf8');

    // Update contract addresses
    contractsContent = contractsContent.replace(
      /META_NEST_WALLET: "[^"]*"/,
      `META_NEST_WALLET: "${deploymentInfo.contracts.metaNestWallet}"`
    );

    contractsContent = contractsContent.replace(
      /USDC_TOKEN: "[^"]*"/,
      `USDC_TOKEN: "${deploymentInfo.contracts.usdcToken}"`
    );

    contractsContent = contractsContent.replace(
      /DAI_TOKEN: "[^"]*"/,
      `DAI_TOKEN: "${deploymentInfo.contracts.daiToken}"`
    );

    fs.writeFileSync(contractsFilePath, contractsContent);

    console.log('✅ Frontend contract addresses updated successfully!');
    console.log('📋 Updated addresses:');
    console.log(
      `   MetaNestWallet: ${deploymentInfo.contracts.metaNestWallet}`
    );
    console.log(`   USDC Token: ${deploymentInfo.contracts.usdcToken}`);
    console.log(`   DAI Token: ${deploymentInfo.contracts.daiToken}`);
  } catch (error) {
    console.error('❌ Failed to update contract addresses:', error);
  }
}

// Run the update
updateContractAddresses();
