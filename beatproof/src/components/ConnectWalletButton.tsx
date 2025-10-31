'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';

const SESSION_COOKIE_ENDPOINT = '/api/session';

type ConnectWalletButtonProps = {
  onMissingWallet?: () => void;
};

export default function ConnectWalletButton({ onMissingWallet }: ConnectWalletButtonProps) {
  const { connected, connecting, connect, disconnect, publicKey, select } = useWallet();
  const [statusMessage, setStatusMessage] = useState('');

  const resolvePhantomProvider = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const anyWindow = window as any;
    if (anyWindow.solana?.isPhantom) {
      return anyWindow.solana;
    }
    if (anyWindow.phantom?.solana?.isPhantom) {
      return anyWindow.phantom.solana;
    }
    return null;
  }, []);

  const handleAction = useCallback(async () => {
    try {
      setStatusMessage('');

      if (connected) {
        await disconnect();
        return;
      }

      if (!resolvePhantomProvider()) {
        setStatusMessage('Phantom wallet not detected. Install Phantom to continue.');
        onMissingWallet?.();
        return;
      }

      select?.('Phantom');
      await connect();
    } catch (error: any) {
      setStatusMessage(error?.message ?? 'Unable to reach Phantom wallet.');
    }
  }, [connected, connect, disconnect, onMissingWallet, resolvePhantomProvider, select]);

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      try {
        if (publicKey) {
          const response = await fetch(SESSION_COOKIE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: publicKey.toBase58() }),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to persist wallet session.');
          }
        } else if (!cancelled) {
          await fetch(SESSION_COOKIE_ENDPOINT, {
            method: 'DELETE',
            credentials: 'include',
          });
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Unable to update wallet session.';
          setStatusMessage(message);
        }
      }
    };

    syncSession();

    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  return (
    <div className="connect-wallet">
      <motion.button
        whileHover={{ scale: connected ? 1.02 : 1.04 }}
        whileTap={{ scale: 0.98 }}
        className={connected ? 'ghost-button' : 'primary-button'}
        onClick={handleAction}
        type="button"
        aria-live="polite"
      >
        {connecting ? 'Connecting…' : connected ? 'Disconnect Phantom' : 'Connect Phantom'}
      </motion.button>

      {statusMessage && (
        <span className="connect-wallet__status" aria-live="polite">
          {statusMessage}
        </span>
      )}
    </div>
  );
}
