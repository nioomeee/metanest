'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

const MOCK_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '2.4567',
    value: '$6,123.45',
    change24h: 5.23,
    icon: '⟠',
    chain: 'Ethereum'
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: '0.1234',
    value: '$5,432.10',
    change24h: -2.15,
    icon: '₿',
    chain: 'Bitcoin'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    balance: '45.67',
    value: '$2,345.67',
    change24h: 8.92,
    icon: '◎',
    chain: 'Solana'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '1,234.56',
    value: '$1,234.56',
    change24h: 0.01,
    icon: '○',
    chain: 'Ethereum'
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    balance: '2,345.67',
    value: '$1,876.54',
    change24h: 12.34,
    icon: '⬟',
    chain: 'Polygon'
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'receive',
    token: 'ETH',
    amount: '0.5',
    from: '0x1234...5678',
    to: '0x9876...5432',
    status: 'confirmed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    hash: '0xabcd...efgh',
    fee: '0.002'
  },
  {
    id: '2',
    type: 'send',
    token: 'USDC',
    amount: '150.00',
    from: '0x9876...5432',
    to: '0x2468...1357',
    status: 'confirmed',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    hash: '0xijkl...mnop',
    fee: '0.001'
  },
  {
    id: '3',
    type: 'send',
    token: 'SOL',
    amount: '10.0',
    from: '0x9876...5432',
    to: '0x1357...2468',
    status: 'pending',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    hash: '0xqrst...uvwx',
    fee: '0.0005'
  },
  {
    id: '4',
    type: 'receive',
    token: 'BTC',
    amount: '0.025',
    from: '0x3691...2580',
    to: '0x9876...5432',
    status: 'confirmed',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    hash: '0xyzab...cdef',
    fee: '0.00015'
  }
];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('$15,011.32');
  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  const connectWallet = () => {
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true);
      setAddress('0x9876...5432');
    }, 1000);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
  };

  const sendTransaction = async (to: string, amount: string, token: string) => {
    // Simulate transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'send',
      token,
      amount,
      from: address,
      to,
      status: 'pending',
      timestamp: new Date(),
      hash: `0x${Math.random().toString(16).substring(2, 18)}...${Math.random().toString(16).substring(2, 6)}`,
      fee: (Math.random() * 0.01).toFixed(6)
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Simulate confirmation after 3 seconds
    setTimeout(() => {
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === newTransaction.id 
            ? { ...tx, status: 'confirmed' as const }
            : tx
        )
      );
    }, 3000);
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      address,
      balance,
      tokens,
      transactions,
      connectWallet,
      disconnectWallet,
      sendTransaction
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}