'use client';

import { BlockchainDemo } from '../../components/BlockchainDemo';
import { Navigation } from '../../components/Navigation';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--nova-bg))]">
      <Navigation />
      <div className="pt-20">
        <BlockchainDemo />
      </div>
    </div>
  );
}
