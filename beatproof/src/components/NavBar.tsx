'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import ConnectWalletButton from './ConnectWalletButton';

const shortenAddress = (value: string) => {
  if (!value) return '';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
};

type NavBarProps = {
  onMissingWallet?: () => void;
};

export default function NavBar({ onMissingWallet }: NavBarProps = {}) {
  const { connected, publicKey } = useWallet();

  const walletAddress = useMemo(() => {
    if (!connected || !publicKey) {
      return null;
    }

    return publicKey.toBase58();
  }, [connected, publicKey]);

  return (
    <motion.header
      className="nav-shell floating"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="brand">
        <Image src="/logo.svg" alt="Beatproof logo" className="brand__logo" width={42} height={42} priority />
        <span>Beatproof</span>
      </div>

      <div className="nav-actions">
        {walletAddress && (
          <span className="wallet-tag" aria-live="polite">
            <span className="wallet-tag__dot" />
            {shortenAddress(walletAddress)}
          </span>
        )}
        <ConnectWalletButton onMissingWallet={onMissingWallet} />
      </div>
    </motion.header>
  );
}
