# MetaNest - Human-First Crypto Wallet

> A human-first crypto wallet built to make Web3 feel as easy as GPay.  
> Intuitive. Cross-chain. Minimal. Gas-optimized. Made for _real_ people.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd metanest
   ```

2. **Install dependencies**

   ```bash
   # Install blockchain dependencies
   npm install

   # Install frontend dependencies
   cd MetaNest-Application
   npm install
   cd ..
   ```

3. **Start the local blockchain**

   ```bash
   npm run start-local
   ```

   This will:

   - Start a local Hardhat node
   - Deploy the MetaNestWallet and test tokens (USDC, DAI)
   - Fund test accounts with initial balances
   - Set up test contacts

4. **Connect MetaMask to local network**

   - Open MetaMask
   - Add network with these settings:
     - Network Name: `MetaNest Local`
     - RPC URL: `http://127.0.0.1:8545`
     - Chain ID: `31337`
     - Currency Symbol: `ETH`
   - Import test accounts using the private keys shown in the terminal

5. **Start the frontend**

   ```bash
   cd MetaNest-Application
   npm run dev
   ```

6. **Open the application**
   - Navigate to `http://localhost:3000`
   - Connect your MetaMask wallet
   - Start using MetaNest!

## 🏗️ Architecture

### Smart Contracts

- **MetaNestWallet.sol**: Main wallet contract with features for:

  - ETH and ERC20 token transfers
  - Contact management
  - Transaction history
  - Pausable functionality for security

- **MockERC20.sol**: Test tokens (USDC, DAI) for development

### Frontend

- **Next.js 13** with TypeScript
- **Tailwind CSS** for styling
- **Ethers.js** for blockchain interaction
- **Radix UI** components for accessibility

### Key Features

- 🔐 **Secure Wallet Management**: Pausable contracts with owner controls
- 💰 **Multi-Token Support**: ETH, USDC, DAI with easy token switching
- 👥 **Contact Management**: Add, update, and delete contacts
- 📊 **Transaction History**: View recent transactions with memos
- 🎨 **Modern UI**: Clean, intuitive interface inspired by modern payment apps
- ⚡ **Gas Optimized**: Efficient smart contract design

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Coverage

The test suite covers:

- Token transfer functionality
- Contact management
- Transaction history
- Pausable functionality
- Error handling

## 🔧 Development

### Available Scripts

```bash
# Blockchain
npm run compile          # Compile smart contracts
npm run test            # Run tests
npm run node            # Start local node only
npm run deploy          # Deploy contracts to localhost
npm run start-local     # Start node + deploy contracts
npm run clean           # Clean build artifacts

# Frontend
cd MetaNest-Application
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
```

### Contract Deployment

The deployment script automatically:

1. Deploys MetaNestWallet contract
2. Deploys USDC and DAI test tokens
3. Funds test accounts with initial balances
4. Sets up test contacts between users

### Test Accounts

After deployment, you'll have access to 4 test accounts:

- **Deployer**: Contract owner with admin privileges
- **User 1-3**: Regular users with funded wallets

Each test user receives:

- 10,000 USDC
- 10,000 DAI
- 10 ETH

## 🌐 Network Configuration

### Local Development

- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **Block Explorer**: None (local network)

### MetaMask Setup

1. Open MetaMask
2. Click "Add Network"
3. Enter the local network details above
4. Import test accounts using private keys from the deployment output

## 📁 Project Structure

```
metanest/
├── contracts/                 # Smart contracts
│   ├── MetaNestWallet.sol    # Main wallet contract
│   └── MockERC20.sol         # Test tokens
├── scripts/                   # Deployment scripts
│   ├── deploy.js             # Contract deployment
│   └── start-local.js        # Local blockchain setup
├── test/                      # Test files
│   └── wallettest.js         # Contract tests
├── MetaNest-Application/      # Frontend application
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   ├── lib/                   # Utilities and services
│   └── ...
├── hardhat.config.js          # Hardhat configuration
└── package.json               # Dependencies and scripts
```

## 🔒 Security Features

- **Pausable Contracts**: Emergency pause functionality
- **Owner Controls**: Admin-only functions for contract management
- **Input Validation**: Comprehensive parameter checking
- **Error Handling**: Custom errors for better UX
- **Gas Optimization**: Efficient contract design

## 🚀 Deployment

### Local Development

```bash
npm run start-local
```

### Production (Future)

1. Update `hardhat.config.js` with production network settings
2. Set environment variables for private keys
3. Run `npm run deploy --network <network-name>`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**MetaMask Connection Failed**

- Ensure MetaMask is installed and unlocked
- Check that you're connected to the correct network (Chain ID: 31337)
- Try refreshing the page

**Transaction Fails**

- Check your account has sufficient balance
- Ensure you're on the correct network
- Verify the recipient address is valid

**Contracts Not Deployed**

- Make sure the local node is running (`npm run node`)
- Check the deployment script output for errors
- Verify contract addresses in the frontend configuration

**Frontend Not Loading**

- Ensure all dependencies are installed
- Check that the development server is running
- Verify the contract addresses are correct

For more help, check the console logs or open an issue on GitHub.
