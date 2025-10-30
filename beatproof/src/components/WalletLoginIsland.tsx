'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import ConnectWalletButton from './ConnectWalletButton';

export default function WalletLoginIsland() {
  const { connected, publicKey } = useWallet();

  return (
    <motion.section
      className="island island--frosted wallet-login floating-delayed"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: 'easeOut', delay: 0.25 }}
      aria-labelledby="wallet-login-title"
    >
      <div className="wallet-login__header">
        <h2 id="wallet-login-title">Secure your Beatproof session</h2>
        <p>
          Connect your Phantom wallet to create a server-side session cookie so future API calls can recognise you instantly.
        </p>
      </div>

      <div className="wallet-login__actions">
        <ConnectWalletButton />
        <Link href="#marketplace" className="ghost-button">
          Enter Marketplace
        </Link>
      </div>

      <div className="wallet-login__status" aria-live="polite">
        {connected ? (
          <span>Connected as {publicKey?.toBase58().slice(0, 4)}…{publicKey?.toBase58().slice(-4)}</span>
        ) : (
          <span>Not connected</span>
        )}
      </div>
    </motion.section>
  );
}
