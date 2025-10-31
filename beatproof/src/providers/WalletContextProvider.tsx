'use client';

import { useEffect, useMemo, useState } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import type { Adapter } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const [wallets, setWallets] = useState<Adapter[]>([]);

  useEffect(() => {
    setWallets([new PhantomWalletAdapter()]);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={wallets.length > 0}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
