'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useToast } from '../hooks/use-toast';
import { blockchainService } from '../lib/blockchain';
import { TOKENS } from '../lib/contracts';
import { ethers } from 'ethers';
import { TroubleshootingGuide } from './TroubleshootingGuide';

interface Balance {
  eth: string;
  usdc: string;
  dai: string;
}

export function BlockchainDemo() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balances, setBalances] = useState<Balance>({
    eth: '0',
    usdc: '0',
    dai: '0',
  });
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const networkInfo = await blockchainService.getNetworkInfo();
      if (networkInfo.chainId === 31337) {
        toast({
          title: 'Connected to Local Network',
          description:
            'You&apos;re connected to the MetaNest local blockchain!',
        });
      } else {
        toast({
          title: 'Wrong Network',
          description:
            'Please switch to the MetaNest local network (Chain ID: 31337)',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Network check failed:', error);
      // Check if it's a connection error (local blockchain not running)
      if (error instanceof Error && error.message.includes('fetch')) {
        toast({
          title: 'Local Blockchain Not Running',
          description:
            'Please start the local blockchain with: npm run start-local',
          variant: 'destructive',
        });
      }
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const connectedAddress = await blockchainService.connectWallet();
      setAddress(connectedAddress);
      setIsConnected(true);

      // Load balances
      await loadBalances(connectedAddress);
      await loadTransactions(connectedAddress);

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${connectedAddress.slice(
          0,
          6
        )}...${connectedAddress.slice(-4)}`,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please check MetaMask.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBalances = async (userAddress: string) => {
    try {
      const ethBalance = await blockchainService.getEthBalance(userAddress);
      const usdcBalance = await blockchainService.getTokenBalance(
        TOKENS.USDC.address,
        userAddress
      );
      const daiBalance = await blockchainService.getTokenBalance(
        TOKENS.DAI.address,
        userAddress
      );

      setBalances({
        eth: ethBalance,
        usdc: usdcBalance,
        dai: daiBalance,
      });
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  };

  const loadTransactions = async (userAddress: string) => {
    try {
      const recentTxs = await blockchainService.getRecentTransactions(
        userAddress
      );
      const formattedTxs = recentTxs.map((tx) =>
        blockchainService.formatTransaction(tx, userAddress)
      );
      setTransactions(formattedTxs);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const sendTransaction = async () => {
    if (!recipient || !amount) {
      toast({
        title: 'Missing Information',
        description: 'Please enter recipient address and amount',
        variant: 'destructive',
      });
      return;
    }

    if (!ethers.isAddress(recipient)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      let tx;

      if (selectedToken === 'ETH') {
        tx = await blockchainService.sendEth(recipient, amount, memo);
      } else {
        const tokenAddress =
          selectedToken === 'USDC' ? TOKENS.USDC.address : TOKENS.DAI.address;
        tx = await blockchainService.sendToken(
          tokenAddress,
          recipient,
          amount,
          memo
        );
      }

      toast({
        title: 'Transaction Sent',
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...`,
      });

      // Wait for confirmation
      await tx.wait();

      toast({
        title: 'Transaction Confirmed',
        description: 'Your transaction has been confirmed!',
      });

      // Reload balances and transactions
      await loadBalances(address);
      await loadTransactions(address);

      // Clear form
      setRecipient('');
      setAmount('');
      setMemo('');
    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLocalNetwork = async () => {
    try {
      await blockchainService.switchToLocalNetwork();
      toast({
        title: 'Network Switched',
        description: 'Successfully switched to MetaNest local network',
      });
      // Re-check connection after network switch
      setTimeout(() => checkConnection(), 1000);
    } catch (error) {
      console.error('Network switch error:', error);
      toast({
        title: 'Network Switch Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Please add the network manually in MetaMask',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MetaNest Blockchain Demo</CardTitle>
          <CardDescription>
            Test the blockchain functionality with your local MetaNest network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <Button onClick={switchToLocalNetwork} variant="outline">
                Switch to Local Network
              </Button>
              <Button onClick={connectWallet} disabled={isLoading}>
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>

              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Manual Network Setup</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If automatic network switching doesn&apos;t work, add the
                  network manually in MetaMask:
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Network Name:</strong> MetaNest Local
                  </div>
                  <div>
                    <strong>RPC URL:</strong> http://127.0.0.1:8545
                  </div>
                  <div>
                    <strong>Chain ID:</strong> 31337
                  </div>
                  <div>
                    <strong>Currency Symbol:</strong> ETH
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ETH Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {parseFloat(balances.eth).toFixed(4)} ETH
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">USDC Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {parseFloat(balances.usdc).toFixed(2)} USDC
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">DAI Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {parseFloat(balances.dai).toFixed(2)} DAI
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Send Transaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        id="recipient"
                        placeholder="0x..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="token">Token</Label>
                      <Select
                        value={selectedToken}
                        onValueChange={setSelectedToken}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="DAI">DAI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="memo">Memo (Optional)</Label>
                      <Input
                        id="memo"
                        placeholder="Transaction memo"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={sendTransaction}
                    disabled={isLoading || !recipient || !amount}
                    className="w-full"
                  >
                    {isLoading ? 'Sending...' : 'Send Transaction'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-muted-foreground">No transactions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <div>
                            <p className="font-medium">
                              {tx.type === 'send' ? 'Sent' : 'Received'}{' '}
                              {tx.amount} {tx.token}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tx.type === 'send'
                                ? `To: ${tx.to.slice(0, 6)}...${tx.to.slice(
                                    -4
                                  )}`
                                : `From: ${tx.from.slice(
                                    0,
                                    6
                                  )}...${tx.from.slice(-4)}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {tx.timestamp.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-green-600">
                              {tx.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <TroubleshootingGuide />
    </div>
  );
}
