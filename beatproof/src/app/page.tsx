'use client';

import { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import FloatingBackground from '@/components/FloatingBackground';
import LandingPage from '@/components/LandingPage';
import MarketplacePage from '@/components/MarketplacePage';

export default function Home() {
  const { connected, connect, connecting } = useWallet();
  const [landingStatus, setLandingStatus] = useState('');

  const handleEnterMarketplace = useCallback(async () => {
    if (connected) {
      return;
    }

    if (typeof window === 'undefined' || !(window as any).phantom?.solana) {
      setLandingStatus('Phantom wallet not detected. Install Phantom to continue.');
      return;
    }

    try {
      setLandingStatus('');
      await connect();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to connect to Phantom wallet.';
      setLandingStatus(message);
    }
  }, [connected, connect]);

  return (
    <div className="app-shell">
      <FloatingBackground />
      <div className="content-layer">
        {connected ? (
          <MarketplacePage />
        ) : (
          <LandingPage
            onEnter={handleEnterMarketplace}
            connecting={connecting}
            statusMessage={landingStatus}
          />
        )}
      </div>
    </div>
  );
}
