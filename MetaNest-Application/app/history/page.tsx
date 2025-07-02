'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft,
  ExternalLink,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useWallet } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/WalletConnect';
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';

export default function HistoryPage() {
  const { isConnected, transactions } = useWallet();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter || tx.status === filter;
    const matchesSearch = search === '' || 
      tx.token.toLowerCase().includes(search.toLowerCase()) ||
      tx.hash.toLowerCase().includes(search.toLowerCase()) ||
      tx.to.toLowerCase().includes(search.toLowerCase()) ||
      tx.from.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-400" />;
      case 'failed':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-400/20 text-green-400';
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400';
      case 'failed':
        return 'bg-red-400/20 text-red-400';
      default:
        return 'bg-gray-400/20 text-gray-400';
    }
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
              <Clock size={80} className="mx-auto mb-8 text-[rgb(var(--nova-accent))]" />
              <h2 className="text-3xl font-bold mb-6">Connect Your Wallet</h2>
              <p className="text-[rgb(var(--nova-text-dim))] mb-8 text-lg">
                Please connect your wallet to view transaction history.
              </p>
              <WalletConnect />
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--nova-bg))]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="p-3 rounded-xl hover:bg-[rgb(var(--nova-card))] transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl font-bold">Transaction History</h1>
              <p className="text-[rgb(var(--nova-text-dim))] text-lg">
                {transactions.length} total transactions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nova-card p-8 rounded-3xl mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[rgb(var(--nova-text-dim))]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="w-full nova-input pl-12 py-3"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <Filter size={20} className="text-[rgb(var(--nova-text-dim))]" />
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'send', label: 'Sent' },
                  { value: 'receive', label: 'Received' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'confirmed', label: 'Confirmed' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      filter === option.value
                        ? 'bg-[rgb(var(--nova-accent))] text-black'
                        : 'bg-[rgb(var(--nova-card))] text-[rgb(var(--nova-text-dim))] hover:text-[rgb(var(--nova-text))]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="nova-card p-16 rounded-3xl text-center"
            >
              <Clock size={64} className="mx-auto mb-6 text-[rgb(var(--nova-text-dim))]" />
              <h3 className="text-2xl font-semibold mb-4">No transactions found</h3>
              <p className="text-[rgb(var(--nova-text-dim))] text-lg">
                {search || filter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Your transactions will appear here'
                }
              </p>
            </motion.div>
          ) : (
            filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="nova-card p-8 rounded-3xl hover:nova-glow transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 flex-1">
                    {/* Transaction Type Icon */}
                    <div className={`p-4 rounded-2xl ${
                      tx.type === 'send' 
                        ? 'bg-red-400/20 text-red-400' 
                        : 'bg-green-400/20 text-green-400'
                    }`}>
                      {tx.type === 'send' ? (
                        <ArrowUpRight size={24} />
                      ) : (
                        <ArrowDownLeft size={24} />
                      )}
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold text-xl">
                          {tx.type === 'send' ? 'Sent' : 'Received'} {tx.token}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-sm flex items-center space-x-2 ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          <span className="capitalize">{tx.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 text-[rgb(var(--nova-text-dim))]">
                        <div>
                          <span className="inline-block w-8">To:</span>
                          <span className="font-mono">{tx.to.slice(0, 10)}...{tx.to.slice(-8)}</span>
                        </div>
                        <div>
                          <span className="inline-block w-16">Hash:</span>
                          <span className="font-mono">{tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</span>
                        </div>
                        <div>
                          <span className="inline-block w-8">Fee:</span>
                          <span>{tx.fee} ETH</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Time */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold mb-2 ${
                      tx.type === 'send' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.token}
                    </div>
                    <div className="text-[rgb(var(--nova-text-dim))] mb-2">
                      {format(tx.timestamp, 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-[rgb(var(--nova-text-dim))]">
                      {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                    </div>
                  </div>

                  {/* External Link */}
                  <button className="ml-6 p-3 rounded-xl hover:bg-[rgb(var(--nova-card))] transition-colors opacity-0 group-hover:opacity-100">
                    <ExternalLink size={20} className="text-[rgb(var(--nova-text-dim))]" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}