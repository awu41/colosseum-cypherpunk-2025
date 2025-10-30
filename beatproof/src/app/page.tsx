'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingBackground from '@/components/FloatingBackground';
import LandingPage from '@/components/LandingPage';
import MarketplacePage from '@/components/MarketplacePage';

export default function Home() {
  const { connected, connect, connecting, publicKey } = useWallet();
  const [landingStatus, setLandingStatus] = useState('');
  const [missingWalletPrompt, setMissingWalletPrompt] = useState(false);
  const [requireWalletPrompt, setRequireWalletPrompt] = useState(false);

  const handleEnterMarketplace = useCallback(async () => {
    if (connected) {
      return;
    }

    if (typeof window === 'undefined' || !(window as any).phantom?.solana) {
      setMissingWalletPrompt(true);
      return;
    }

    try {
      setLandingStatus('');
      await connect();
      if (!publicKey) {
        setRequireWalletPrompt(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to connect to Phantom wallet.';
      setLandingStatus(message);
      setRequireWalletPrompt(true);
    }
  }, [connected, connect, publicKey]);

  useEffect(() => {
    if (connected) {
      setMissingWalletPrompt(false);
      setRequireWalletPrompt(false);
      setLandingStatus('');
    }
  }, [connected]);

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
            onMissingWallet={() => setMissingWalletPrompt(true)}
          />
        )}
      </div>
      <AnimatePresence>
        {missingWalletPrompt && (
          <motion.div
            key="missing-wallet"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35 }}
            className="island prompt-island"
            role="dialog"
            aria-labelledby="missing-wallet-title"
          >
            <div className="prompt-island__header">
              <h3 id="missing-wallet-title">Install Phantom Wallet</h3>
              <p>
                We couldn&apos;t detect the Phantom browser extension. Install Phantom to connect and explore the Beatproof
                marketplace.
              </p>
            </div>
            <div className="prompt-island__actions">
              <a
                className="pill-button pill-button--primary"
                href="https://phantom.app/download"
                target="_blank"
                rel="noreferrer"
              >
                Download Phantom
              </a>
              <button
                type="button"
                className="pill-button pill-button--ghost"
                onClick={() => setMissingWalletPrompt(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {requireWalletPrompt && (
          <motion.div
            key="require-wallet"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35 }}
            className="island prompt-island"
            role="dialog"
            aria-labelledby="require-wallet-title"
          >
            <div className="prompt-island__header">
              <h3 id="require-wallet-title">Connect to continue</h3>
              <p>
                A connected Phantom wallet is required to enter the Beatproof marketplace. Please connect and approve the
                request in your Phantom window.
              </p>
            </div>
            <div className="prompt-island__actions">
              <button
                type="button"
                className="pill-button pill-button--primary"
                onClick={() => {
                  setRequireWalletPrompt(false);
                  void handleEnterMarketplace();
                }}
              >
                Try Again
              </button>
              <button
                type="button"
                className="pill-button pill-button--ghost"
                onClick={() => setRequireWalletPrompt(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
