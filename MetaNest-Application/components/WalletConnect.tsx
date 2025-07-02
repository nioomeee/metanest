'use client';

import { motion } from 'framer-motion';
import { Wallet, Loader2 } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';

export function WalletConnect() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    connectWallet();
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3 nova-card px-4 py-2 rounded-xl"
      >
        <div className="w-3 h-3 bg-[rgb(var(--nova-accent))] rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">{address}</span>
        <button
          onClick={disconnectWallet}
          className="text-xs text-[rgb(var(--nova-text-dim))] hover:text-[rgb(var(--nova-text))] transition-colors"
        >
          Disconnect
        </button>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={handleConnect}
      disabled={isLoading}
      className="nova-button flex items-center space-x-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isLoading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <Wallet size={20} />
      )}
      <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
    </motion.button>
  );
}