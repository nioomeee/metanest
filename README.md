<div align="center">

<img src="https://img.shields.io/badge/MetaNest-Web3%20Wallet-6366f1?style=for-the-badge&logo=ethereum&logoColor=white" alt="MetaNest" height="50"/>

# 🪺 MetaNest

### *Human-first crypto wallet. Web3, made for everyone.*

> A full-stack Web3 wallet platform with smart contract infrastructure, multi-token support,
> contact management, and a polished Next.js frontend — built to remove the friction from decentralized finance.

<br/>

[![Solidity](https://img.shields.io/badge/Solidity-0.8.x-363636?style=flat-square&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-13-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Latest-F7DF1E?style=flat-square&logo=ethereum&logoColor=black)](https://hardhat.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-2535A0?style=flat-square&logo=ethereum&logoColor=white)](https://ethers.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

<br/>

[🚀 Quick Start](#-quick-start) · [🏗️ Architecture](#%EF%B8%8F-architecture) · [📜 Smart Contracts](#-smart-contracts) · [🌐 Frontend](#-frontend-application) · [🧪 Testing](#-testing) · [🐛 Troubleshooting](#-troubleshooting)

---

</div>

## 🌟 What is MetaNest?

MetaNest is a **production-grade Web3 crypto wallet** that bridges the gap between complex blockchain infrastructure and everyday users. It combines a battle-tested Solidity smart contract with a sleek Next.js frontend, letting users send ETH and ERC20 tokens, manage contacts, and track transaction history — all with the simplicity of a traditional fintech app.

**Why MetaNest?**
- 🔐 **Secure by design** — Pausable contracts with owner controls baked in
- 👛 **Multi-asset** — ETH, USDC, DAI, and any ERC20 token
- 📒 **Address book** — Save contacts with human-readable names
- 📜 **Full history** — Every transfer logged on-chain with memo support
- ⚡ **Gas optimized** — Lean contract design to minimize fees
- 🌍 **Cross-platform** — Web, mobile-ready, Docker support

---

## 🏗️ Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                        MetaNest System                              ║
╠══════════════╦═══════════════════════╦═══════════════════════════════╣
║              ║                       ║                               ║
║  👤 User     ║  🌐 Frontend          ║  ⛓️  Blockchain               ║
║              ║                       ║                               ║
║  MetaMask ───╫──► Next.js 13         ║  Hardhat Local Node           ║
║  Wallet      ║    Port :3000         ║  Port :8545                   ║
║              ║                       ║                               ║
║              ║  WalletContext.tsx ───╫──► MetaNestWallet.sol         ║
║              ║  BlockchainService ───╫──► MockERC20.sol (USDC/DAI)  ║
║              ║  Ethers.js v6      ───╫──► Events & State            ║
║              ║                       ║                               ║
╠══════════════╩═══════════════════════╩═══════════════════════════════╣
║                                                                      ║
║  📦 Docker Compose                                                   ║
║  ┌─────────────────────┐   ┌─────────────────────────────────────┐  ║
║  │  blockchain service  │   │  frontend service                   │  ║
║  │  hardhat node        │   │  next.js app                        │  ║
║  │  auto-deploy         │   │  reads from contracts.ts config     │  ║
║  └─────────────────────┘   └─────────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Smart Contracts** | Solidity + Hardhat | On-chain wallet logic |
| **Frontend** | Next.js 13 + TypeScript | User interface |
| **Styling** | Tailwind CSS + Radix UI | Design system |
| **Web3 Layer** | Ethers.js v6 | Blockchain interaction |
| **Testing** | Mocha + Chai | Contract test suite |
| **DevOps** | Docker + Docker Compose | Container orchestration |
| **Browser Wallet** | MetaMask | Transaction signing |

---

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- ![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=nodedotjs&logoColor=white) — [Download](https://nodejs.org/)
- ![MetaMask](https://img.shields.io/badge/MetaMask-Extension-E2761B?style=flat-square&logo=metamask&logoColor=white) — [Download](https://metamask.io/)
- ![Git](https://img.shields.io/badge/Git-Latest-F05032?style=flat-square&logo=git&logoColor=white) — [Download](https://git-scm.com/)
- ![Docker](https://img.shields.io/badge/Docker-Optional-2496ED?style=flat-square&logo=docker&logoColor=white) *(optional, for containerized setup)*

---

### ⚡ Option A — Local Development (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/metanest.git
cd metanest

# 2. Install root dependencies (Hardhat, contracts)
npm install

# 3. Install frontend dependencies
cd MetaNest-Application && npm install && cd ..

# 4. Start the Hardhat local blockchain AND deploy contracts
npm run start-local
```

Open a **second terminal**:

```bash
# 5. Start the Next.js frontend
cd MetaNest-Application
npm run dev
```

🎉 **Done!** Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 🐳 Option B — Docker (One Command)

```bash
# Start everything (blockchain + frontend)
npm run docker:start

# Check running services
docker-compose ps

# Tail logs
npm run docker:logs

# Tear down
npm run docker:stop
```

---

### 🦊 Configure MetaMask

After the local node is running, connect MetaMask to it:

| Setting | Value |
|---|---|
| Network Name | `MetaNest Local` |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | `ETH` |

> 💡 **Tip:** Copy a private key from the Hardhat terminal output and import it into MetaMask to get a pre-funded test account.

---

## 📜 Smart Contracts

### Contract Addresses *(local network)*

| Contract | Address |
|---|---|
| `MetaNestWallet` | `0x9A676e781A523b5d0C0e43731313A708CB607508` |
| `USDC (MockERC20)` | `0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0` |
| `DAI (MockERC20)` | `0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82` |

---

### MetaNestWallet.sol

The core contract that powers all wallet operations.

<details>
<summary><strong>💸 Token Operations</strong></summary>

```solidity
// Send ETH with an optional memo
function sendEth(address to, uint256 amount, string calldata memo) external payable

// Send any ERC20 token
function sendToken(address token, address to, uint256 amount, string calldata memo) external

// Deposit ETH into the wallet
function depositEth() external payable

// Withdraw ETH from the wallet
function withdrawEth(uint256 amount) external

// Read ETH balance for any user
function getEthBalance(address user) external view returns (uint256)
```

</details>

<details>
<summary><strong>📒 Contact Management</strong></summary>

```solidity
function addContact(address contactAddress, string calldata name) external
function updateContact(address contactAddress, string calldata name) external
function deleteContact(address contactAddress) external
function getContact(address user, address contactAddress) external view returns (string memory)
```

</details>

<details>
<summary><strong>📜 Transaction History</strong></summary>

```solidity
// Returns the last 5 transactions for a user
function getRecentTransactions(address user) external view returns (Transaction[] memory)

struct Transaction {
    address token;      // ERC20 address, or 0x0 for ETH
    address to;         // Recipient
    uint256 amount;     // Amount sent
    uint256 timestamp;  // Block timestamp
}
```

</details>

<details>
<summary><strong>🔒 Security</strong></summary>

```solidity
// Emergency pause — owner only
function togglePause() external onlyOwner

// Check if contract is active
function paused() external view returns (bool)
```

</details>

<details>
<summary><strong>📡 Events</strong></summary>

```solidity
event EthSent(address indexed from, address indexed to, uint256 amount, string memo);
event TokenSent(address indexed from, address indexed to, address indexed token, uint256 amount, string memo);
event ContactAdded(address indexed user, address indexed contactAddress, string name);
event ContactUpdated(address indexed user, address indexed contactAddress, string name);
event ContactDeleted(address indexed user, address indexed contactAddress);
event EthDeposited(address indexed user, uint256 amount);
event EthWithdrawn(address indexed user, uint256 amount);
```

</details>

---

## 🌐 Frontend Application

### Project Structure

```
MetaNest-Application/
├── app/
│   ├── dashboard/          # 🏠 Main wallet view
│   ├── send/               # 💸 Send ETH / tokens
│   ├── history/            # 📜 Transaction log
│   ├── settings/           # ⚙️  Wallet settings
│   └── demo/               # 🧪 Blockchain demo
│
├── components/
│   ├── ui/                 # Reusable UI primitives (Radix)
│   ├── CreateWallet.tsx    # Wallet onboarding
│   ├── Navigation.tsx      # App-wide nav bar
│   └── BlockchainDemo.tsx  # Live demo component
│
├── contexts/
│   └── WalletContext.tsx   # 🌐 Global wallet state
│
├── lib/
│   ├── blockchain.ts       # BlockchainService class
│   ├── contracts.ts        # Contract addresses & ABIs
│   └── utils.ts            # Shared helpers
│
└── hooks/
    └── use-toast.ts        # Toast notification hook
```

### BlockchainService API

```typescript
class BlockchainService {
  connectWallet(): Promise<string>
  getEthBalance(address: string): Promise<string>
  getTokenBalance(tokenAddress: string, userAddress: string): Promise<string>
  sendEth(to: string, amount: string, memo: string): Promise<ContractTransactionResponse>
  sendToken(tokenAddress: string, to: string, amount: string, memo: string): Promise<ContractTransactionResponse>
  addContact(contactAddress: string, name: string): Promise<ContractTransactionResponse>
  updateContact(contactAddress: string, name: string): Promise<ContractTransactionResponse>
  deleteContact(contactAddress: string): Promise<ContractTransactionResponse>
  getRecentTransactions(userAddress: string): Promise<Transaction[]>
}
```

---

## 🛠️ Available Scripts

### Blockchain (root)

| Command | Description |
|---|---|
| `npm run compile` | Compile Solidity contracts |
| `npm run test` | Run full contract test suite |
| `npm run node` | Start Hardhat node only |
| `npm run deploy` | Deploy contracts to localhost |
| `npm run start-local` | Start node + deploy in one step |
| `npm run clean` | Remove build artifacts |

### Frontend (`MetaNest-Application/`)

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

### Docker

| Command | Description |
|---|---|
| `npm run docker:start` | Start all containers (prod) |
| `npm run docker:start:dev` | Start with volume mounts (dev) |
| `npm run docker:logs` | Tail all container logs |
| `npm run docker:stop` | Stop and remove containers |

---

## 🧪 Testing

```bash
# Run the full smart contract test suite
npm test
```

The test suite covers:

- ✅ ETH deposit, withdrawal, and transfer
- ✅ ERC20 token sends
- ✅ Contact add / update / delete
- ✅ Transaction history retrieval
- ✅ Pause / unpause (owner-only guard)
- ✅ Revert conditions and error handling

```javascript
describe('MetaNestWallet', () => {
  describe('Token Transfers', () => { ... })
  describe('Contact Management', () => { ... })
  describe('Transaction History', () => { ... })
  describe('Security & Pausable', () => { ... })
})
```

---

## 🚀 Production Deployment

### 1 — Deploy Contracts to a Live Network

```bash
npm run compile
npm run deploy -- --network <network-name>   # e.g. sepolia, mainnet
```

### 2 — Update Contract Addresses

Edit `MetaNest-Application/lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  META_NEST_WALLET: '0x...', // your deployed address
  USDC_TOKEN:       '0x...',
  DAI_TOKEN:        '0x...',
};
```

### 3 — Build & Serve Frontend

```bash
cd MetaNest-Application
npm run build
npm run start
```

---

## 🐛 Troubleshooting

<details>
<summary><strong>❌ Can't connect to blockchain</strong></summary>

```bash
# Verify the Hardhat node is alive
curl http://localhost:8545

# Restart it
npm run node
```

</details>

<details>
<summary><strong>❌ Contract deployment fails</strong></summary>

```bash
# Recompile and re-check config
npm run compile
cat hardhat.config.js
npm run deploy
```

</details>

<details>
<summary><strong>❌ Frontend won't start / stale cache</strong></summary>

```bash
cd MetaNest-Application
rm -rf .next
npm install
npm run dev
```

</details>

<details>
<summary><strong>❌ MetaMask issues</strong></summary>

- ✅ MetaMask is unlocked
- ✅ Network set to Chain ID `31337`, RPC `http://127.0.0.1:8545`
- ✅ Contract addresses in `contracts.ts` match deployed output
- ✅ Browser cache cleared

</details>

<details>
<summary><strong>❌ Docker containers not starting</strong></summary>

```bash
docker-compose ps          # check status
docker-compose logs -f     # tail all logs
```

</details>

---

## 🔐 Security

Found a vulnerability? **Please do not open a public GitHub issue.**

- 📧 Email the security team directly
- Include a detailed description and proof of concept
- We follow responsible disclosure and will respond promptly

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for Web3 newcomers and power users alike**

[![GitHub](https://img.shields.io/badge/GitHub-Repo-181717?style=flat-square&logo=github)](https://github.com/your-username/metanest)
[![Docs](https://img.shields.io/badge/Docs-DOCS.md-6366f1?style=flat-square)](DOCS.md)
[![Docker Guide](https://img.shields.io/badge/Docker-DOCKER.md-2496ED?style=flat-square&logo=docker&logoColor=white)](DOCKER.md)
[![Issues](https://img.shields.io/badge/Issues-GitHub-red?style=flat-square&logo=github)](https://github.com/your-username/metanest/issues)

*Last updated: May 2026*

</div>
