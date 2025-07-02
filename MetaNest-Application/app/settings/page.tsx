'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Key,
  Eye,
  EyeOff,
  Download,
  Bell,
  Globe,
  Smartphone,
  AlertTriangle,
  Moon,
  Palette,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useWallet } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/WalletConnect';
import { useState } from 'react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { isConnected, address, disconnectWallet } = useWallet();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    biometrics: false,
    autoLock: true,
    testnetMode: false,
    darkMode: true, // Always true for this app
  });

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Setting updated');
  };

  const exportPrivateKey = () => {
    toast.error('Private key export is disabled in demo mode');
  };

  const resetWallet = () => {
    toast.error('Wallet reset is disabled in demo mode');
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
              <Shield
                size={80}
                className="mx-auto mb-8 text-[rgb(var(--nova-accent))]"
              />
              <h2 className="text-3xl font-bold mb-6">Connect Your Wallet</h2>
              <p className="text-[rgb(var(--nova-text-dim))] mb-8 text-lg">
                Please connect your wallet to access settings.
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
              <h1 className="text-4xl font-bold">Settings</h1>
              <p className="text-[rgb(var(--nova-text-dim))] text-lg">
                Manage your wallet preferences
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="nova-card p-8 rounded-3xl"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
              <Shield size={28} className="text-[rgb(var(--nova-accent))]" />
              <span>Account Information</span>
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block font-medium mb-3 text-lg">
                  Wallet Address
                </label>
                <div className="nova-card p-6 rounded-2xl font-mono break-all">
                  {address}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-3 text-lg">
                  Network
                </label>
                <div className="nova-card p-6 rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-[rgb(var(--nova-accent))] rounded-full"></div>
                    <span className="text-lg">Ethereum Mainnet</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="nova-card p-8 rounded-3xl"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
              <Key size={28} className="text-[rgb(var(--nova-accent))]" />
              <span>Security</span>
            </h2>

            <div className="space-y-8">
              {/* Private Key */}
              <div className="p-6 nova-card rounded-2xl border border-red-400/20">
                <div className="flex items-start space-x-4">
                  <AlertTriangle size={24} className="text-red-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-400 mb-4 text-lg">
                      Private Key
                    </h3>
                    <div className="mb-6">
                      <div className="bg-black/50 p-4 rounded-xl font-mono">
                        {showPrivateKey
                          ? '0x1234567890abcdef1234567890abcdef12345678'
                          : '••••••••••••••••••••••••••••••••••••••••'}
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-400/20 text-red-400 rounded-xl hover:bg-red-400/30 transition-colors"
                      >
                        {showPrivateKey ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                        <span>{showPrivateKey ? 'Hide' : 'Show'}</span>
                      </button>
                      <button
                        onClick={exportPrivateKey}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-400/20 text-red-400 rounded-xl hover:bg-red-400/30 transition-colors"
                      >
                        <Download size={18} />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Toggles */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Smartphone
                      size={24}
                      className="text-[rgb(var(--nova-text-dim))]"
                    />
                    <div>
                      <div className="font-medium text-lg">
                        Biometric Authentication
                      </div>
                      <div className="text-[rgb(var(--nova-text-dim))]">
                        Use fingerprint or face ID
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.biometrics}
                    onCheckedChange={() => handleSettingChange('biometrics')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Shield
                      size={24}
                      className="text-[rgb(var(--nova-text-dim))]"
                    />
                    <div>
                      <div className="font-medium text-lg">Auto-Lock</div>
                      <div className="text-[rgb(var(--nova-text-dim))]">
                        Lock wallet after 5 minutes
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoLock}
                    onCheckedChange={() => handleSettingChange('autoLock')}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* App Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="nova-card p-8 rounded-3xl"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
              <Palette size={28} className="text-[rgb(var(--nova-accent))]" />
              <span>Preferences</span>
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Bell
                    size={24}
                    className="text-[rgb(var(--nova-text-dim))]"
                  />
                  <div>
                    <div className="font-medium text-lg">
                      Push Notifications
                    </div>
                    <div className="text-[rgb(var(--nova-text-dim))]">
                      Get notified about transactions
                    </div>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={() => handleSettingChange('notifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Moon
                    size={24}
                    className="text-[rgb(var(--nova-text-dim))]"
                  />
                  <div>
                    <div className="font-medium text-lg">Dark Mode</div>
                    <div className="text-[rgb(var(--nova-text-dim))]">
                      Always enabled for Metanest
                    </div>
                  </div>
                </div>
                <Switch checked={settings.darkMode} disabled={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Globe
                    size={24}
                    className="text-[rgb(var(--nova-text-dim))]"
                  />
                  <div>
                    <div className="font-medium text-lg">Testnet Mode</div>
                    <div className="text-[rgb(var(--nova-text-dim))]">
                      Use test networks for development
                    </div>
                  </div>
                </div>
                <Switch
                  checked={settings.testnetMode}
                  onCheckedChange={() => handleSettingChange('testnetMode')}
                />
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="nova-card p-8 rounded-3xl border border-red-400/20"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3 text-red-400">
              <AlertTriangle size={28} />
              <span>Danger Zone</span>
            </h2>

            <div className="space-y-6">
              <div className="p-6 bg-red-400/10 rounded-2xl">
                <h3 className="font-semibold text-red-400 mb-3 text-lg">
                  Disconnect Wallet
                </h3>
                <p className="text-[rgb(var(--nova-text-dim))] mb-4">
                  This will disconnect your wallet from the application.
                </p>
                <button
                  onClick={disconnectWallet}
                  className="px-6 py-3 bg-red-400/20 text-red-400 rounded-xl hover:bg-red-400/30 transition-colors"
                >
                  Disconnect
                </button>
              </div>

              <div className="p-6 bg-red-400/10 rounded-2xl">
                <h3 className="font-semibold text-red-400 mb-3 text-lg">
                  Reset Wallet
                </h3>
                <p className="text-[rgb(var(--nova-text-dim))] mb-4">
                  This will permanently delete all wallet data. This action
                  cannot be undone.
                </p>
                <button
                  onClick={resetWallet}
                  className="px-6 py-3 bg-red-400/20 text-red-400 rounded-xl hover:bg-red-400/30 transition-colors"
                >
                  Reset Wallet
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
