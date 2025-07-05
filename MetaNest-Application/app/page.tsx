'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Lock,
  Layers,
  TrendingUp,
  Sparkles,
  Star,
} from 'lucide-react';
import { WalletConnect } from '@/components/WalletConnect';
import { Navigation } from '@/components/Navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: Shield,
    title: 'Secure by Design',
    description:
      'Military-grade encryption and security protocols protect your assets.',
    gradient: 'from-[rgb(var(--nova-accent))] to-blue-400',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Instant transactions across multiple blockchains with minimal fees.',
    gradient: 'from-[rgb(var(--nova-purple))] to-pink-400',
  },
  {
    icon: Globe,
    title: 'Multi-Chain Support',
    description:
      'Manage Ethereum, Solana, Bitcoin, and more from one interface.',
    gradient: 'from-[rgb(var(--nova-accent))] to-[rgb(var(--nova-purple))]',
  },
  {
    icon: Lock,
    title: 'Your Keys, Your Crypto',
    description:
      'Non-custodial wallet gives you complete control over your assets.',
    gradient: 'from-orange-400 to-red-400',
  },
  {
    icon: Layers,
    title: 'DeFi Ready',
    description: 'Seamlessly interact with DeFi protocols and earn yield.',
    gradient: 'from-green-400 to-[rgb(var(--nova-accent))]',
  },
  {
    icon: TrendingUp,
    title: 'Portfolio Tracking',
    description: 'Real-time portfolio analytics and performance insights.',
    gradient: 'from-[rgb(var(--nova-purple))] to-blue-400',
  },
];

export default function Home() {
  const { isConnected } = useWallet();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isConnected) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--nova-bg))]">
      <Navigation />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-8 pt-16">
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[rgb(var(--nova-accent))]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[rgb(var(--nova-purple))]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[rgb(var(--nova-accent))]/5 to-[rgb(var(--nova-purple))]/5 rounded-full blur-3xl"></div>

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[rgb(var(--nova-accent))] rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center justify-center space-x-2 mb-6"
              >
                <Star size={20} className="text-[rgb(var(--nova-accent))]" />
                <span className="text-[rgb(var(--nova-accent))] font-medium">
                  The Future is Here
                </span>
                <Star size={20} className="text-[rgb(var(--nova-accent))]" />
              </motion.div>

              <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight">
                The Future of <br />
                <span className="nova-gradient-text relative">
                  Crypto Wallets
                  <motion.div
                    className="absolute -inset-2 nova-gradient opacity-20 blur-xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </span>
              </h1>
              <motion.p
                className="text-xl lg:text-2xl text-[rgb(var(--nova-text-dim))] mb-12 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Experience the next generation of decentralized finance with
                Metanest. Secure, fast, and designed for the multi-chain future.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
            >
              <div className="flex flex-col items-center justify-center">
                <WalletConnect />
              </div>
              {isConnected && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleGetStarted}
                  className="nova-button-secondary flex items-center space-x-2 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Enter Wallet</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </motion.button>
              )}
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20"
            >
              {[
                {
                  label: 'Total Value Locked',
                  value: '$2.4B+',
                  icon: TrendingUp,
                },
                { label: 'Active Users', value: '100+', icon: Sparkles },
                { label: 'Total Tests', value: '10+', icon: Globe },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="nova-card p-8 rounded-3xl group hover:nova-glow transition-all duration-500"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <stat.icon
                    size={32}
                    className="text-[rgb(var(--nova-accent))] mb-4 mx-auto"
                  />
                  <div className="text-4xl font-bold nova-gradient-text mb-3">
                    {stat.value}
                  </div>
                  <div className="text-[rgb(var(--nova-text-dim))]">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 lg:px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgb(var(--nova-card))]/20 to-transparent"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl lg:text-6xl font-bold mb-8">
                Built for the{' '}
                <span className="nova-gradient-text">Decentralized Future</span>
              </h2>
              <p className="text-xl text-[rgb(var(--nova-text-dim))] max-w-4xl mx-auto leading-relaxed">
                Metanest combines cutting-edge security with intuitive design,
                giving you the power to manage your digital assets like never
                before.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="nova-card p-8 rounded-3xl group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--nova-accent))]/5 to-[rgb(var(--nova-purple))]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}
                    >
                      <Icon size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 relative z-10">
                      {feature.title}
                    </h3>
                    <p className="text-[rgb(var(--nova-text-dim))] leading-relaxed relative z-10">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="nova-card p-16 rounded-3xl nova-glow relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--nova-accent))]/10 to-[rgb(var(--nova-purple))]/10"></div>

              <div className="relative z-10">
                <h2 className="text-4xl lg:text-5xl font-bold mb-8">
                  Ready to Enter the{' '}
                  <span className="nova-gradient-text">Meta</span>?
                </h2>
                <p className="text-lg text-[rgb(var(--nova-text-dim))] mb-12 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of users who have already discovered the future
                  of crypto wallets. Your journey to financial freedom starts
                  here.
                </p>
                {!isConnected ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                      <WalletConnect />
                    </div>
                  </div>
                ) : (
                  <motion.button
                    onClick={handleGetStarted}
                    className="nova-button flex items-center space-x-2 mx-auto text-lg px-8 py-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Launch Wallet</span>
                    <ArrowRight size={24} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
