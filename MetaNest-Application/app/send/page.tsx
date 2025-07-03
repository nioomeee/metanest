'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  QrCode, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useWallet } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/WalletConnect';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SendPage() {
  const { isConnected, tokens, sendTransaction } = useWallet();
  const [selectedToken, setSelectedToken] = useState(tokens[0]?.symbol || 'ETH');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const selectedTokenData = tokens.find(t => t.symbol === selectedToken);
  const estimatedFee = '0.002';
  const estimatedTotal = amount ? (parseFloat(amount) + parseFloat(estimatedFee)).toFixed(6) : '0';

  const handleSend = async () => {
    if (!amount || !recipient) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (selectedTokenData && parseFloat(amount) > parseFloat(selectedTokenData.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmTransaction = async () => {
    setIsLoading(true);
    try {
      await sendTransaction(recipient, amount, selectedToken);
      toast.success('Transaction submitted successfully!');
      setShowConfirmation(false);
      setAmount('');
      setRecipient('');
    } catch (error) {
      toast.error('Transaction failed');
    } finally {
      setIsLoading(false);
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
              <Send size={80} className="mx-auto mb-8 text-[rgb(var(--nova-accent))]" />
              <h2 className="text-3xl font-bold mb-6">Connect Your Wallet</h2>
              <p className="text-[rgb(var(--nova-text-dim))] mb-8 text-lg">
                Please connect your wallet to send crypto.
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
      
      <main className="max-w-4xl mx-auto p-6 lg:p-8">
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
              <h1 className="text-4xl font-bold">Send Crypto</h1>
              <p className="text-[rgb(var(--nova-text-dim))] text-lg">
                Transfer your assets securely
              </p>
            </div>
          </div>
        </motion.div>

        {/* Send Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nova-card p-10 rounded-3xl mb-8"
        >
          {/* Token Selection */}
          <div className="mb-8">
            <label className="block text-lg font-medium mb-4">Select Token</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tokens.map((token) => (
                <motion.button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token.symbol)}
                  className={`p-6 rounded-2xl border transition-all duration-300 ${
                    selectedToken === token.symbol
                      ? 'border-[rgb(var(--nova-accent))] bg-[rgb(var(--nova-accent))]/10 nova-glow'
                      : 'border-[rgb(var(--nova-border))] hover:border-[rgb(var(--nova-accent))]/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-3xl mb-3">{token.icon}</div>
                  <div className="font-semibold text-lg">{token.symbol}</div>
                  <div className="text-sm text-[rgb(var(--nova-text-dim))]">
                    {token.balance}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recipient Address */}
          <div className="mb-8">
            <label className="block text-lg font-medium mb-4">Recipient Address</label>
            <div className="flex space-x-4">
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x... or ENS name"
                className="flex-1 nova-input text-lg py-4"
              />
              <button className="nova-button-secondary px-6">
                <QrCode size={24} />
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-medium">Amount</label>
              {selectedTokenData && (
                <button
                  onClick={() => setAmount(selectedTokenData.balance)}
                  className="text-[rgb(var(--nova-accent))] hover:underline"
                >
                  Max: {selectedTokenData.balance} {selectedToken}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full nova-input text-lg py-4 pr-24"
              />
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-[rgb(var(--nova-text-dim))] font-medium">
                {selectedToken}
              </div>
            </div>
            {selectedTokenData && amount && (
              <p className="text-[rgb(var(--nova-text-dim))] mt-3">
                ≈ ${(parseFloat(amount || '0') * parseFloat(selectedTokenData.value.replace('$', '').replace(',', '')) / parseFloat(selectedTokenData.balance)).toFixed(2)}
              </p>
            )}
          </div>

          {/* Transaction Summary */}
          <div className="nova-card p-8 rounded-2xl mb-8">
            <h3 className="font-semibold text-xl mb-6">Transaction Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-[rgb(var(--nova-text-dim))]">Amount</span>
                <span>{amount || '0'} {selectedToken}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-[rgb(var(--nova-text-dim))]">Network Fee</span>
                <span>{estimatedFee} ETH</span>
              </div>
              <div className="border-t border-[rgb(var(--nova-border))] pt-4">
                <div className="flex justify-between font-semibold text-xl">
                  <span>Total</span>
                  <span>{estimatedTotal} {selectedToken}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={!amount || !recipient || isLoading}
            className="w-full nova-button flex items-center justify-center space-x-3 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: !amount || !recipient ? 1 : 1.02 }}
            whileTap={{ scale: !amount || !recipient ? 1 : 0.98 }}
          >
            <Send size={24} />
            <span>Review Transaction</span>
          </motion.button>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="nova-card p-8 rounded-2xl border-yellow-400/20"
        >
          <div className="flex items-start space-x-4">
            <AlertTriangle size={24} className="text-yellow-400 mt-1" />
            <div>
              <h4 className="font-medium text-yellow-400 mb-3 text-lg">Important Notice</h4>
              <p className="text-[rgb(var(--nova-text-dim))] leading-relaxed">
                Double-check the recipient address before sending. Transactions on the blockchain 
                are irreversible and cannot be undone.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="nova-card p-10 rounded-3xl max-w-md w-full nova-glow"
            >
              <div className="text-center mb-8">
                <CheckCircle size={80} className="mx-auto mb-6 text-[rgb(var(--nova-accent))]" />
                <h3 className="text-3xl font-bold mb-4">Confirm Transaction</h3>
                <p className="text-[rgb(var(--nova-text-dim))] text-lg">
                  Please review the details before confirming
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-lg">
                  <span className="text-[rgb(var(--nova-text-dim))]">Send</span>
                  <span className="font-semibold">{amount} {selectedToken}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-[rgb(var(--nova-text-dim))]">To</span>
                  <span className="font-mono text-sm">{recipient.slice(0, 10)}...{recipient.slice(-8)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-[rgb(var(--nova-text-dim))]">Network Fee</span>
                  <span>{estimatedFee} ETH</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isLoading}
                  className="flex-1 nova-button-secondary py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmTransaction}
                  disabled={isLoading}
                  className="flex-1 nova-button flex items-center justify-center space-x-2 py-3"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                  <span>{isLoading ? 'Sending...' : 'Confirm'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}