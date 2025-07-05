const { spawn } = require('child_process');
const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function startLocalBlockchain() {
  console.log('🚀 Starting MetaNest local blockchain...\n');

  // Start Hardhat node
  const hardhatNode = spawn('npx', ['hardhat', 'node'], {
    stdio: 'pipe',
    shell: true,
  });

  hardhatNode.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);

    // Check if node is ready
    if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
      console.log('\n✅ Local blockchain is ready!');
      console.log('📡 RPC URL: http://127.0.0.1:8545');
      console.log('🔗 Chain ID: 31337');

      // Wait a bit for the node to fully start
      setTimeout(() => {
        deployContracts();
      }, 2000);
    }
  });

  hardhatNode.stderr.on('data', (data) => {
    console.error('❌ Hardhat node error:', data.toString());
  });

  hardhatNode.on('close', (code) => {
    console.log(`\n🔚 Hardhat node process exited with code ${code}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down local blockchain...');
    hardhatNode.kill('SIGINT');
    process.exit(0);
  });
}

async function deployContracts() {
  try {
    console.log('\n📦 Deploying contracts...');

    // Run deployment script
    const deployProcess = spawn(
      'npx',
      ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost'],
      {
        stdio: 'inherit',
        shell: true,
      }
    );

    deployProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n🔄 Updating frontend contract addresses...');

        // Update frontend contract addresses
        const updateProcess = spawn('node', ['scripts/update-frontend.js'], {
          stdio: 'inherit',
          shell: true,
        });

        updateProcess.on('close', (updateCode) => {
          if (updateCode === 0) {
            console.log('\n🎉 Local blockchain setup complete!');
            console.log('\n📋 To connect MetaMask:');
            console.log('1. Open MetaMask');
            console.log('2. Add network: http://127.0.0.1:8545');
            console.log('3. Chain ID: 31337');
            console.log(
              '4. Import test accounts using private keys shown above'
            );
            console.log(
              '\n🌐 Start the frontend: cd MetaNest-Application && npm run dev'
            );
          } else {
            console.error('❌ Failed to update frontend addresses');
          }
        });
      } else {
        console.error('❌ Contract deployment failed');
      }
    });
  } catch (error) {
    console.error('❌ Deployment error:', error);
  }
}

// Start the local blockchain
startLocalBlockchain();
