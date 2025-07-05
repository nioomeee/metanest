// Contract addresses for local development
export const CONTRACTS = {
  META_NEST_WALLET: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Will be updated after deployment
  USDC_TOKEN: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Will be updated after deployment
  DAI_TOKEN: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Will be updated after deployment
};

// Network configuration
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

// Token configuration
export const TOKENS = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    icon: '/icons/eth.svg',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 18,
    address: CONTRACTS.USDC_TOKEN,
    icon: '/icons/usdc.svg',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    address: CONTRACTS.DAI_TOKEN,
    icon: '/icons/dai.svg',
  },
};

// Contract ABIs (simplified versions for frontend)
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
  'event TokenSent(address indexed from, address indexed to, address indexed token, uint256 amount, string memo)',
  'event EthSent(address indexed from, address indexed to, uint256 amount, string memo)',
  'event ContactAdded(address indexed user, address indexed contactAddress, string name)',
  'event ContactUpdated(address indexed user, address indexed contactAddress, string name)',
  'event ContactDeleted(address indexed user, address indexed contactAddress)',
  'event EthDeposited(address indexed user, uint256 amount)',
  'event EthWithdrawn(address indexed user, uint256 amount)',
];

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

// Helper function to update contract addresses after deployment
export function updateContractAddresses(deploymentInfo: any) {
  CONTRACTS.META_NEST_WALLET = deploymentInfo.contracts.metaNestWallet;
  CONTRACTS.USDC_TOKEN = deploymentInfo.contracts.usdcToken;
  CONTRACTS.DAI_TOKEN = deploymentInfo.contracts.daiToken;

  // Update token addresses
  TOKENS.USDC.address = CONTRACTS.USDC_TOKEN;
  TOKENS.DAI.address = CONTRACTS.DAI_TOKEN;
}
