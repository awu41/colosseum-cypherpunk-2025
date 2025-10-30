'use client';

import { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';

export default function ConnectWalletButton() {
  const { connected, connecting, connect, disconnect } = useWallet();
  const [statusMessage, setStatusMessage] = useState('');

  const handleAction = useCallback(async () => {
    try {
      setStatusMessage('');

      if (connected) {
        await disconnect();
        return;
      }

      await connect();
    } catch (error: any) {
      setStatusMessage(error?.message ?? 'Unable to reach Phantom wallet.');
    }
  }, [connected, connect, disconnect]);

  return (
    <div>
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
        <span style={{ display: 'block', marginTop: '0.45rem', color: '#f6d86a', fontSize: '0.75rem' }}>
          {statusMessage}
        </span>
      )}
    </div>
  );
}

