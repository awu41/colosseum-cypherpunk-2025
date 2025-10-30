'use client';

import { useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

  const wallets = useMemo(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    return [new PhantomWalletAdapter()];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

