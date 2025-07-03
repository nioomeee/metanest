'use client';

import { motion } from 'framer-motion';
import {
  Send,
  Download,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useWallet } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/WalletConnect';
import { CreateWallet } from '@/components/CreateWallet';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function Dashboard() {
  const { isConnected, address, balance, tokens, transactions } = useWallet();
  const [showBalance, setShowBalance] = useState(true);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[rgb(var(--nova-bg))]">
        <Navigation />
        <main className="flex items-center justify-center min-h-screen p-6">
          <div className="text-center max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="nova-card p-12 rounded-3xl nova-glow"
            >
              <Wallet
                size={80}
                className="mx-auto mb-8 text-[rgb(var(--nova-accent))]"
              />
              <h2 className="text-3xl font-bold mb-6">Connect Your Wallet</h2>
              <p className="text-[rgb(var(--nova-text-dim))] mb-8 text-lg">
                Please connect your wallet to access the dashboard.
              </p>
              <WalletConnect />
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="min-h-screen bg-[rgb(var(--nova-bg))]">
      <Navigation />

      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Welcome Back,{' '}
              <span className="nova-gradient-text">Crypto Pioneer</span>
            </h1>
            <div className="flex items-center space-x-3 text-[rgb(var(--nova-text-dim))]">
              <span>Wallet:</span>
              <code className="bg-[rgb(var(--nova-card))] px-3 py-1 rounded-lg font-mono text-sm">
                {address}
              </code>
              <button
                onClick={copyAddress}
                className="p-1 hover:text-[rgb(var(--nova-accent))] transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-6 lg:mt-0">
            <WalletConnect />
            <CreateWallet />
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nova-card p-10 rounded-3xl mb-12 nova-glow relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--nova-accent))]/5 to-[rgb(var(--nova-purple))]/5"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[rgb(var(--nova-text-dim))] mb-3 text-lg">
                  Total Portfolio Value
                </p>
                <div className="flex items-center space-x-6">
                  <h2 className="text-5xl lg:text-6xl font-bold">
                    {showBalance ? balance : '••••••'}
                  </h2>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-3 rounded-xl hover:bg-[rgb(var(--nova-card))] transition-colors"
                  >
                    {showBalance ? <Eye size={28} /> : <EyeOff size={28} />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-3 text-green-400 mb-3">
                  <TrendingUp size={24} />
                  <span className="font-semibold text-xl">+12.34%</span>
                </div>
                <p className="text-[rgb(var(--nova-text-dim))]">24h change</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/send" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full nova-button flex items-center justify-center space-x-3 py-4 text-lg"
                >
                  <Send size={24} />
                  <span>Send</span>
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 nova-button-secondary flex items-center justify-center space-x-3 py-4 text-lg"
              >
                <Download size={24} />
                <span>Receive</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 nova-button-secondary flex items-center justify-center space-x-3 py-4 text-lg"
              >
                <Plus size={24} />
                <span>Buy</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Tokens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="nova-card p-8 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Your Assets</h3>
              <span className="text-[rgb(var(--nova-text-dim))] bg-[rgb(var(--nova-card))] px-3 py-1 rounded-full text-sm">
                {tokens.length} tokens
              </span>
            </div>

            <div className="space-y-4">
              {tokens.length === 0 ? (
                <div className="text-center text-[rgb(var(--nova-text-dim))]">
                  No tokens found. Only ETH balance is currently supported.
                </div>
              ) : (
                tokens.map((token, index) => (
                  <motion.div
                    key={token.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-6 rounded-2xl hover:bg-[rgb(var(--nova-card))] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[rgb(var(--nova-accent))]/20"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{token.icon}</div>
                      <div>
                        <div className="font-semibold text-lg">
                          {token.symbol}
                        </div>
                        <div className="text-sm text-[rgb(var(--nova-text-dim))]">
                          {token.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {token.balance}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-[rgb(var(--nova-text-dim))]">
                          {token.value}
                        </span>
                        <div
                          className={`flex items-center space-x-1 text-sm px-2 py-1 rounded-full ${
                            token.change24h >= 0
                              ? 'text-green-400 bg-green-400/10'
                              : 'text-red-400 bg-red-400/10'
                          }`}
                        >
                          {token.change24h >= 0 ? (
                            <TrendingUp size={14} />
                          ) : (
                            <TrendingDown size={14} />
                          )}
                          <span>{Math.abs(token.change24h).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="nova-card p-8 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Recent Activity</h3>
              <Link
                href="/history"
                className="text-[rgb(var(--nova-accent))] hover:underline flex items-center space-x-1 group"
              >
                <span>View All</span>
                <ExternalLink
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center text-[rgb(var(--nova-text-dim))]">
                  No transactions found.
                </div>
              ) : (
                recentTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-6 rounded-2xl hover:bg-[rgb(var(--nova-card))] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[rgb(var(--nova-accent))]/20"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-full ${
                          tx.type === 'send'
                            ? 'bg-red-400/20 text-red-400'
                            : 'bg-green-400/20 text-green-400'
                        }`}
                      >
                        {tx.type === 'send' ? (
                          <ArrowUpRight size={20} />
                        ) : (
                          <ArrowDownLeft size={20} />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-lg capitalize">
                          {tx.type} {tx.token}
                        </div>
                        <div className="text-sm text-[rgb(var(--nova-text-dim))]">
                          {tx.type === 'send'
                            ? `To ${tx.to.slice(0, 10)}...`
                            : `From ${tx.from.slice(0, 10)}...`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold text-lg ${
                          tx.type === 'send' ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {tx.type === 'send' ? '-' : '+'}
                        {tx.amount}
                      </div>
                      <div
                        className={`text-xs px-3 py-1 rounded-full inline-block ${
                          tx.status === 'confirmed'
                            ? 'bg-green-400/20 text-green-400'
                            : tx.status === 'pending'
                            ? 'bg-yellow-400/20 text-yellow-400'
                            : 'bg-red-400/20 text-red-400'
                        }`}
                      >
                        {tx.status}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
