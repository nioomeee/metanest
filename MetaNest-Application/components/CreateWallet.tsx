import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import * as solanaWeb3 from '@solana/web3.js';
import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';

const BLOCKCHAINS = [
  { label: 'Ethereum (EVM)', value: 'ethereum' },
  { label: 'Solana', value: 'solana' },
  { label: 'Bitcoin', value: 'bitcoin' },
];

export function CreateWallet() {
  const [open, setOpen] = useState(false);
  const [blockchain, setBlockchain] = useState('ethereum');
  const [address, setAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setAddress('');
    setPrivateKey('');
    setMnemonic('');
    try {
      if (blockchain === 'ethereum') {
        const wallet = ethers.Wallet.createRandom();
        setAddress(wallet.address);
        setPrivateKey(wallet.privateKey);
        setMnemonic(wallet.mnemonic?.phrase || '');
      } else if (blockchain === 'solana') {
        const keypair = solanaWeb3.Keypair.generate();
        setAddress(keypair.publicKey.toBase58());
        setPrivateKey(Buffer.from(keypair.secretKey).toString('hex'));
      } else if (blockchain === 'bitcoin') {
        const mnemonic = bip39.generateMnemonic();
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const root = bitcoin.bip32.fromSeed(seed);
        const child = root.derivePath("m/44'/0'/0'/0/0");
        const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });
        setAddress(address || '');
        setPrivateKey(child.toWIF());
        setMnemonic(mnemonic);
      }
    } catch (err) {
      toast.error('Failed to create wallet.');
    }
    setLoading(false);
  };

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied!`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Create Wallet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Wallet</DialogTitle>
          <DialogDescription>
            Select a blockchain and generate a new wallet. Save your private key
            and mnemonic securely.{' '}
            <span className="text-red-500 font-bold">
              Never share your private key with anyone!
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Blockchain</label>
            <select
              className="w-full border rounded p-2"
              value={blockchain}
              onChange={(e) => setBlockchain(e.target.value)}
              disabled={loading}
            >
              {BLOCKCHAINS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate Wallet'}
          </Button>
          {address && (
            <div className="bg-[rgb(var(--nova-card))] text-[rgb(var(--nova-text))] p-4 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Address:</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(address, 'Address')}
                >
                  Copy
                </Button>
              </div>
              <Input value={address} readOnly className="mb-2" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Private Key:</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(privateKey, 'Private Key')}
                >
                  Copy
                </Button>
              </div>
              <Input value={privateKey} readOnly className="mb-2" />
              {mnemonic && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Mnemonic:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(mnemonic, 'Mnemonic')}
                    >
                      Copy
                    </Button>
                  </div>
                  <Input value={mnemonic} readOnly className="mb-2" />
                </>
              )}
              <div className="text-xs text-red-500 font-bold mt-2">
                Save your private key and mnemonic securely. Losing them means
                losing access to your wallet!
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
