'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Wallet, 
  Send, 
  History, 
  Settings,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Wallet', icon: Wallet },
  { href: '/send', label: 'Send', icon: Send },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[rgb(var(--nova-bg))]/80 border-b border-[rgb(var(--nova-border))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 nova-gradient rounded-xl flex items-center justify-center group-hover:nova-glow transition-all duration-300">
                  <Zap size={20} className="text-black" />
                </div>
                <div className="absolute inset-0 nova-gradient rounded-xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300"></div>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold nova-gradient-text">NovaWallet</h1>
                <p className="text-xs text-[rgb(var(--nova-text-dim))] -mt-1">Next-gen crypto</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={cn(
                        "relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300",
                        isActive 
                          ? "text-[rgb(var(--nova-accent))]" 
                          : "text-[rgb(var(--nova-text-dim))] hover:text-[rgb(var(--nova-text))]"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isActive && (
                        <motion.div 
                          className="absolute inset-0 bg-[rgb(var(--nova-accent))]/10 rounded-xl nova-glow"
                          layoutId="activeNavTab"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <Icon size={18} className="relative z-10" />
                      <span className="font-medium text-sm relative z-10">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-[rgb(var(--nova-card))] transition-colors"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="lg:hidden overflow-hidden border-t border-[rgb(var(--nova-border))]"
        >
          <div className="px-6 py-4 space-y-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ 
                    x: isMobileMenuOpen ? 0 : -20,
                    opacity: isMobileMenuOpen ? 1 : 0
                  }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300",
                        isActive 
                          ? "bg-[rgb(var(--nova-accent))]/10 text-[rgb(var(--nova-accent))] nova-glow" 
                          : "text-[rgb(var(--nova-text-dim))] hover:text-[rgb(var(--nova-text))] hover:bg-[rgb(var(--nova-card))]"
                      )}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </>
  );
}