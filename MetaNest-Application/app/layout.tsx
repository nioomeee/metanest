import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WalletProvider } from '@/contexts/WalletContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NovaWallet - Next-Gen Crypto Wallet',
  description: 'A futuristic multi-chain crypto wallet for the decentralized future',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <WalletProvider>
          {children}
          <Toaster theme="dark" />
        </WalletProvider>
      </body>
    </html>
  );
}