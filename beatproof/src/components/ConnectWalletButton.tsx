'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';

const SESSION_COOKIE_ENDPOINT = '/api/session';

type ConnectWalletButtonProps = {
  onMissingWallet?: () => void;
};

export default function ConnectWalletButton({ onMissingWallet }: ConnectWalletButtonProps) {
  const { connected, connecting, connect, disconnect, publicKey } = useWallet();
  const [statusMessage, setStatusMessage] = useState('');
  const [sessionMessage, setSessionMessage] = useState('');

  const handleAction = useCallback(async () => {
    try {
      setStatusMessage('');

      if (connected) {
        await disconnect();
        return;
      }

      if (typeof window === 'undefined' || !(window as any).phantom?.solana) {
        setStatusMessage('Phantom wallet not detected. Install Phantom to continue.');
        onMissingWallet?.();
        return;
      }

      await connect();
    } catch (error: any) {
      setStatusMessage(error?.message ?? 'Unable to reach Phantom wallet.');
    }
  }, [connected, connect, disconnect, onMissingWallet]);

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      try {
        if (!cancelled) {
          setSessionMessage('');
        }
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

          if (!cancelled) {
            setSessionMessage('Wallet session cached for backend.');
          }
        } else {
          await fetch(SESSION_COOKIE_ENDPOINT, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!cancelled) {
            setSessionMessage('Wallet session cleared.');
          }
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Unable to update wallet session.';
          setSessionMessage(message);
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

      {sessionMessage && (
        <span className="connect-wallet__status" aria-live="polite">
          {sessionMessage}
        </span>
      )}
    </div>
  );
}
