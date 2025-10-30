'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnimatePresence } from 'framer-motion';
import FloatingBackground from '@/components/FloatingBackground';
import LandingPage from '@/components/LandingPage';
import MarketplacePage from '@/components/MarketplacePage';

export default function Home() {
  const { connected } = useWallet();
  const [activeView, setActiveView] = useState('landing');
  const [devMode, setDevMode] = useState(false);

  const handleEnterDevMode = useCallback(() => {
    setDevMode(true);
    setActiveView('marketplace');
  }, []);

  const handleExitDevMode = useCallback(() => {
    setDevMode(false);
    if (!connected) {
      setActiveView('landing');
    }
  }, [connected]);

  useEffect(() => {
    if (connected) {
      setDevMode(false);
      setActiveView('marketplace');
    } else if (!devMode) {
      setActiveView('landing');
    }
  }, [connected, devMode]);

  return (
    <div className="app-shell">
      <FloatingBackground />
      <div className="content-layer">
        <AnimatePresence mode="wait">
          {activeView === 'landing' ? (
            <LandingPage key="landing" onDevExplore={handleEnterDevMode} />
          ) : (
            <MarketplacePage
              key="marketplace"
              devMode={devMode}
              onExitDev={handleExitDevMode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

