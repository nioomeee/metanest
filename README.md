# 📚 MetaNest Documentation

> Comprehensive documentation for the MetaNest crypto wallet platform

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Smart Contracts](#smart-contracts)
4. [Frontend Application](#frontend-application)
5. [API Reference](#api-reference)
6. [Development Guide](#development-guide)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

MetaNest is a human-first crypto wallet built to make Web3 accessible to everyone. This documentation provides comprehensive technical details for developers, contributors, and users.

### Key Features

- **Multi-token Support**: ETH, ERC20 tokens (USDC, DAI)
- **Contact Management**: Save and organize frequently used addresses
- **Transaction History**: Detailed records with memo support
- **Enhanced Security**: Pausable contracts with owner controls
- **Gas Optimization**: Efficient smart contract design
- **Cross-Platform**: Web, mobile-ready, Docker support

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Blockchain    │    │   External      │
│   (Next.js)     │◄──►│   (Hardhat)     │◄──►│   (MetaMask)    │
│   Port: 3000    │    │   Port: 8545    │    │   Browser       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS, Radix UI
- **Blockchain**: Solidity, Hardhat, Ethers.js v6
- **Testing**: Mocha, Chai, Hardhat Test
- **Deployment**: Docker, Docker Compose
- **Development**: ESLint, Prettier, TypeScript

---

## 📜 Smart Contracts

### MetaNestWallet.sol

The core wallet contract that handles all wallet operations.

#### Contract Address

```solidity
// Deployed on local network (Chain ID: 31337)
MetaNestWallet: 0x9A676e781A523b5d0C0e43731313A708CB607508
```

#### Key Functions

##### Token Operations

```solidity
// Send ETH to another address
function sendEth(
    address to,
    uint256 amount,
    string calldata memo
) external payable

// Send ERC20 tokens
function sendToken(
    address token,
    address to,
    uint256 amount,
    string calldata memo
) external

// Get ETH balance
function getEthBalance(address user) external view returns (uint256)

// Deposit ETH into wallet
function depositEth() external payable

// Withdraw ETH from wallet
function withdrawEth(uint256 amount) external
```

##### Contact Management

```solidity
// Add a new contact
function addContact(address contactAddress, string calldata name) external

// Update existing contact
function updateContact(address contactAddress, string calldata name) external

// Delete contact
function deleteContact(address contactAddress) external

// Get contact name
function getContact(address user, address contactAddress) external view returns (string memory)
```

##### Transaction History

```solidity
// Get recent transactions (last 5)
function getRecentTransactions(address user) external view returns (Transaction[] memory)

// Transaction struct
struct Transaction {
    address token;      // Token address (0x0 for ETH)
    address to;         // Recipient address
    uint256 amount;     // Transaction amount
    uint256 timestamp;  // Block timestamp
}
```

##### Security Functions

```solidity
// Pause/unpause contract (owner only)
function togglePause() external onlyOwner

// Check if contract is paused
function paused() external view returns (bool)
```

#### Events

```solidity
// Token transfer events
event TokenSent(address indexed from, address indexed to, address indexed token, uint256 amount, string memo);
event EthSent(address indexed from, address indexed to, uint256 amount, string memo);

// Contact management events
event ContactAdded(address indexed user, address indexed contactAddress, string name);
event ContactUpdated(address indexed user, address indexed contactAddress, string name);
event ContactDeleted(address indexed user, address indexed contactAddress);

// ETH operations events
event EthDeposited(address indexed user, uint256 amount);
event EthWithdrawn(address indexed user, uint256 amount);
```

### MockERC20.sol

Test token contract for development and testing.

#### Contract Addresses

```solidity
// USDC Token
USDC: 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0

// DAI Token
DAI: 0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82
```

#### Functions

```solidity
// Standard ERC20 functions
function name() external view returns (string memory)
function symbol() external view returns (string memory)
function decimals() external view returns (uint8)
function totalSupply() external view returns (uint256)
function balanceOf(address account) external view returns (uint256)
function transfer(address to, uint256 amount) external returns (bool)
function approve(address spender, uint256 amount) external returns (bool)
function transferFrom(address from, address to, uint256 amount) external returns (bool)
```

---

## 🌐 Frontend Application

### Project Structure

```
MetaNest-Application/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Main wallet dashboard
│   ├── send/             # Send transaction page
│   ├── history/          # Transaction history
│   ├── settings/         # Wallet settings
│   └── demo/             # Blockchain demo page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── CreateWallet.tsx  # Wallet creation
│   ├── Navigation.tsx    # Navigation bar
│   └── BlockchainDemo.tsx # Demo component
├── contexts/             # React contexts
│   └── WalletContext.tsx # Wallet state management
├── lib/                  # Utilities and services
│   ├── blockchain.ts     # Blockchain service
│   ├── contracts.ts      # Contract configuration
│   └── utils.ts          # Utility functions
└── hooks/                # Custom React hooks
    └── use-toast.ts      # Toast notifications
```

### Key Components

#### WalletContext.tsx

Manages global wallet state and blockchain interactions.

```typescript
interface WalletContextType {
  isConnected: boolean;
  address: string;
  balance: string;
  tokens: Token[];
  transactions: Transaction[];
  connectWallet: () => void;
  disconnectWallet: () => void;
  sendTransaction: (to: string, amount: string, token: string) => Promise<void>;
}
```

#### BlockchainService

Handles all blockchain interactions.

```typescript
class BlockchainService {
  // Connect to wallet
  async connectWallet(): Promise<string>;

  // Get balances
  async getEthBalance(address: string): Promise<string>;
  async getTokenBalance(
    tokenAddress: string,
    userAddress: string
  ): Promise<string>;

  // Send transactions
  async sendEth(
    to: string,
    amount: string,
    memo: string
  ): Promise<ContractTransactionResponse>;
  async sendToken(
    tokenAddress: string,
    to: string,
    amount: string,
    memo: string
  ): Promise<ContractTransactionResponse>;

  // Contact management
  async addContact(
    contactAddress: string,
    name: string
  ): Promise<ContractTransactionResponse>;
  async updateContact(
    contactAddress: string,
    name: string
  ): Promise<ContractTransactionResponse>;
  async deleteContact(
    contactAddress: string
  ): Promise<ContractTransactionResponse>;

  // Transaction history
  async getRecentTransactions(userAddress: string): Promise<any[]>;
}
```

---

## 🔌 API Reference

### Contract ABIs

#### MetaNestWallet ABI

```typescript
export const META_NEST_WALLET_ABI = [
  'function getEthBalance(address user) external view returns (uint256)',
  'function sendEth(address to, uint256 amount, string calldata memo) external payable',
  'function sendToken(address token, address to, uint256 amount, string calldata memo) external',
  'function addContact(address contactAddress, string calldata name) external',
  'function updateContact(address contactAddress, string calldata name) external',
  'function deleteContact(address contactAddress) external',
  'function getContact(address user, address contactAddress) external view returns (string memory)',
  'function getRecentTransactions(address user) external view returns (tuple(address token, address to, uint256 amount, uint256 timestamp)[])',
  'function depositEth() external payable',
  'function withdrawEth(uint256 amount) external',
  // Events
  'event TokenSent(address indexed from, address indexed to, address indexed token, uint256 amount, string memo)',
  'event EthSent(address indexed from, address indexed to, uint256 amount, string memo)',
  'event ContactAdded(address indexed user, address indexed contactAddress, string name)',
  'event ContactUpdated(address indexed user, address indexed contactAddress, string name)',
  'event ContactDeleted(address indexed user, address indexed contactAddress)',
  'event EthDeposited(address indexed user, uint256 amount)',
  'event EthWithdrawn(address indexed user, uint256 amount)',
];
```

#### ERC20 ABI

```typescript
export const ERC20_ABI = [
  'function name() external view returns (string memory)',
  'function symbol() external view returns (string memory)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];
```

### Network Configuration

```typescript
export const NETWORK_CONFIG = {
  chainId: 31337,
  chainName: 'MetaNest Local',
  rpcUrl: 'http://127.0.0.1:8545',
  blockExplorer: '',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};
```

---

## 🛠️ Development Guide

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Git
- MetaMask browser extension

### Local Development Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd metanest
```

#### 2. Install Dependencies

```bash
# Install blockchain dependencies
npm install

# Install frontend dependencies
cd MetaNest-Application
npm install
cd ..
```

#### 3. Start Development Environment

```bash
# Start blockchain and deploy contracts
npm run start-local

# In another terminal, start frontend
cd MetaNest-Application
npm run dev
```

#### 4. Configure MetaMask

- Add network: `http://127.0.0.1:8545` (Chain ID: 31337)
- Import test accounts using private keys from terminal output

### Available Scripts

#### Blockchain Scripts

```bash
npm run compile          # Compile smart contracts
npm run test            # Run contract tests
npm run node            # Start Hardhat node only
npm run deploy          # Deploy contracts to localhost
npm run start-local     # Start node + deploy contracts
npm run clean           # Clean build artifacts
```

#### Frontend Scripts

```bash
cd MetaNest-Application
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Code Style Guidelines

#### Solidity

- Use SPDX license identifier
- Follow Solidity style guide
- Add comprehensive comments
- Use custom errors for gas efficiency

#### TypeScript/React

- Use TypeScript strict mode
- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling

---

## 🚀 Deployment

### Docker Deployment

#### Production Mode

```bash
# Start all services
npm run docker:start

# Check status
docker-compose ps

# View logs
npm run docker:logs

# Stop services
npm run docker:stop
```

#### Development Mode

```bash
# Start with volume mounts
npm run docker:start:dev

# View development logs
npm run docker:logs:dev

# Stop development services
npm run docker:stop:dev
```

### Manual Deployment

#### 1. Deploy Smart Contracts

```bash
# Compile contracts
npm run compile

# Deploy to target network
npm run deploy -- --network <network-name>
```

#### 2. Update Frontend Configuration

Update contract addresses in `MetaNest-Application/lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  META_NEST_WALLET: '0x...', // Deployed contract address
  USDC_TOKEN: '0x...',
  DAI_TOKEN: '0x...',
};
```

#### 3. Build and Deploy Frontend

```bash
cd MetaNest-Application
npm run build
npm run start
```

---

## 🧪 Testing

### Smart Contract Testing

#### Run All Tests

```bash
npm test
```

#### Test Coverage

The test suite covers:

- Token transfer functionality
- Contact management
- Transaction history
- Pausable functionality
- Error handling
- ETH operations

#### Test Structure

```javascript
describe('MetaNestWallet', function () {
  describe('Token Transfer Functionality', function () {
    it('Should transfer tokens successfully', async function () {
      // Test implementation
    });
  });

  describe('Contact Management', function () {
    it('Should add, update, and delete contacts', async function () {
      // Test implementation
    });
  });
});
```

### Frontend Testing

#### Component Testing

```bash
cd MetaNest-Application
npm test
```

#### E2E Testing

```bash
npm run test:e2e
```

---

## 🐛 Troubleshooting

### Common Issues

#### Blockchain Connection Issues

```bash
# Check if Hardhat node is running
curl http://localhost:8545

# Restart blockchain service
npm run node
```

#### Contract Deployment Failures

```bash
# Check contract compilation
npm run compile

# Verify network configuration
cat hardhat.config.js

# Check deployment logs
npm run deploy
```

#### Frontend Issues

```bash
# Check dependencies
cd MetaNest-Application
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### MetaMask Issues

- Ensure MetaMask is unlocked
- Check network configuration (Chain ID: 31337)
- Verify contract addresses are correct
- Clear browser cache and reload

### Debug Commands

#### Check Service Status

```bash
# Docker services
docker-compose ps

# Local services
netstat -an | grep :3000
netstat -an | grep :8545
```

#### View Logs

```bash
# Docker logs
docker-compose logs -f

# Hardhat logs
npm run node

# Frontend logs
cd MetaNest-Application && npm run dev
```

---

### Security Issues

For security vulnerabilities:

- **DO NOT** create public issues
- Email security team directly
- Include detailed vulnerability description
- Provide proof of concept if possible

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Repository**: [GitHub](https://github.com/your-username/metanest)
- **Documentation**: [DOCS.md](DOCS.md)
- **Docker Guide**: [DOCKER.md](DOCKER.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/metanest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/metanest/discussions)

---

_Last updated: July 2024_
