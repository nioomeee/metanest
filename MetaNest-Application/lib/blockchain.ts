import { ethers } from 'ethers';
import {
  CONTRACTS,
  META_NEST_WALLET_ABI,
  ERC20_ABI,
  TOKENS,
  NETWORK_CONFIG,
} from './contracts';

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private walletContract: ethers.Contract | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum as any);
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.provider) {
      throw new Error('No Ethereum provider found. Please install MetaMask.');
    }

    try {
      // Request account access
      const accounts = await this.provider.send('eth_requestAccounts', []);
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.signer = await this.provider.getSigner();
      this.walletContract = new ethers.Contract(
        CONTRACTS.META_NEST_WALLET,
        META_NEST_WALLET_ABI,
        this.signer
      );

      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async getEthBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get ETH balance:', error);
      throw error;
    }
  }

  async getTokenBalance(
    tokenAddress: string,
    userAddress: string
  ): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        this.provider
      );
      const balance = await tokenContract.balanceOf(userAddress);
      const decimals = await tokenContract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw error;
    }
  }

  async sendEth(
    to: string,
    amount: string,
    memo: string = ''
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.walletContract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await this.walletContract.sendEth(to, amountWei, memo, {
        value: amountWei,
      });
      return tx;
    } catch (error) {
      console.error('Failed to send ETH:', error);
      throw error;
    }
  }

  async sendToken(
    tokenAddress: string,
    to: string,
    amount: string,
    memo: string = ''
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.walletContract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        this.signer
      );
      const decimals = await tokenContract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);

      // First approve the wallet contract to spend tokens
      const approveTx = await tokenContract.approve(
        CONTRACTS.META_NEST_WALLET,
        amountWei
      );
      await approveTx.wait();

      // Then send tokens through the wallet contract
      const tx = await this.walletContract.sendToken(
        tokenAddress,
        to,
        amountWei,
        memo
      );
      return tx;
    } catch (error) {
      console.error('Failed to send token:', error);
      throw error;
    }
  }

  async addContact(
    contactAddress: string,
    name: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.walletContract) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.walletContract.addContact(contactAddress, name);
      return tx;
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  }

  async updateContact(
    contactAddress: string,
    name: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.walletContract) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.walletContract.updateContact(contactAddress, name);
      return tx;
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  }

  async deleteContact(
    contactAddress: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.walletContract) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.walletContract.deleteContact(contactAddress);
      return tx;
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  }

  async getContact(
    userAddress: string,
    contactAddress: string
  ): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const walletContract = new ethers.Contract(
        CONTRACTS.META_NEST_WALLET,
        META_NEST_WALLET_ABI,
        this.provider
      );
      const contactName = await walletContract.getContact(
        userAddress,
        contactAddress
      );
      return contactName;
    } catch (error) {
      console.error('Failed to get contact:', error);
      throw error;
    }
  }

  async getRecentTransactions(userAddress: string): Promise<any[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const walletContract = new ethers.Contract(
        CONTRACTS.META_NEST_WALLET,
        META_NEST_WALLET_ABI,
        this.provider
      );
      const transactions = await walletContract.getRecentTransactions(
        userAddress
      );
      return transactions;
    } catch (error) {
      console.error('Failed to get recent transactions:', error);
      throw error;
    }
  }

  async depositEth(
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.walletContract) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await this.walletContract.depositEth({ value: amountWei });
      return tx;
    } catch (error) {
      console.error('Failed to deposit ETH:', error);
      throw error;
    }
  }

  async withdrawEth(
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.walletContract) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await this.walletContract.withdrawEth(amountWei);
      return tx;
    } catch (error) {
      console.error('Failed to withdraw ETH:', error);
      throw error;
    }
  }

  async switchToLocalNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      // First try to switch to the network if it already exists
      try {
        await window.ethereum.request!({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
        });
        return; // Successfully switched
      } catch (switchError: any) {
        // If the network doesn't exist (error code 4902), add it
        if (switchError.code === 4902) {
          await window.ethereum.request!({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
                chainName: NETWORK_CONFIG.chainName,
                nativeCurrency: NETWORK_CONFIG.nativeCurrency,
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
                blockExplorerUrls: NETWORK_CONFIG.blockExplorer
                  ? [NETWORK_CONFIG.blockExplorer]
                  : [],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error: any) {
      console.error('Failed to switch/add network:', error);

      // Provide more specific error messages
      if (error.code === 4001) {
        throw new Error('User rejected the network switch request');
      } else if (error.code === -32602) {
        throw new Error('Invalid network parameters');
      } else {
        throw new Error(
          `Network switch failed: ${error.message || 'Unknown error'}`
        );
      }
    }
  }

  async getNetworkInfo(): Promise<{ chainId: number; chainName: string }> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        chainName: network.name || 'Unknown',
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }

  // Helper method to format transaction data
  formatTransaction(tx: any, userAddress: string): any {
    const isOutgoing = tx.to.toLowerCase() === userAddress.toLowerCase();
    return {
      id: `${tx.token}-${tx.to}-${tx.amount}-${tx.timestamp}`,
      type: isOutgoing ? 'send' : 'receive',
      token: tx.token === ethers.ZeroAddress ? 'ETH' : 'Token',
      amount: ethers.formatEther(tx.amount),
      from: isOutgoing ? userAddress : tx.to,
      to: isOutgoing ? tx.to : userAddress,
      status: 'confirmed',
      timestamp: new Date(Number(tx.timestamp) * 1000),
      hash: '',
      fee: '',
    };
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
