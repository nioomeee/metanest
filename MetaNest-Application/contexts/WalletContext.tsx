'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { blockchainService } from '../lib/blockchain';
import { TOKENS } from '../lib/contracts';

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change24h: number;
  icon: string;
  chain: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  token: string;
  amount: string;
  from: string;
  to: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  hash: string;
  fee: string;
}

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

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Add this type for window.ethereum
interface EthereumProvider {
  isMetaMask?: boolean;
  request?: (...args: any[]) => Promise<any>;
}
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    if (window.ethereum && isConnected) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum as any);
      setProvider(ethProvider);
      ethProvider
        .send('eth_requestAccounts', [])
        .then(async (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            const bal = await ethProvider.getBalance(accounts[0]);
            setBalance(ethers.formatEther(bal) + ' ETH');
          }
        });
    }
  }, [isConnected]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const ethProvider = new ethers.BrowserProvider(window.ethereum as any);
        const accounts = await ethProvider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
          const bal = await ethProvider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(bal) + ' ETH');
        }
      } catch (err) {
        alert('Wallet connection failed.');
      }
    } else {
      alert(
        'MetaMask is not installed. Please install MetaMask and try again.'
      );
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    setBalance('');
    setTokens([]);
    setTransactions([]);
    setProvider(null);
  };

  const sendTransaction = async (to: string, amount: string, token: string) => {
    if (!provider || !address) return;
    try {
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      // Optionally, update balance and transactions here
      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal) + ' ETH');
      // For now, just add a simple transaction record
      setTransactions((prev) => [
        {
          id: tx.hash,
          type: 'send',
          token: 'ETH',
          amount,
          from: address,
          to,
          status: 'confirmed',
          timestamp: new Date(),
          hash: tx.hash,
          fee: '',
        },
        ...prev,
      ]);
    } catch (err) {
      alert('Transaction failed.');
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        tokens,
        transactions,
        connectWallet,
        disconnectWallet,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
