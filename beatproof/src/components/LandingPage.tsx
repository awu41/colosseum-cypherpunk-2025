'use client';

import { motion } from 'framer-motion';
import NavBar from './NavBar';
import LandingHero from './LandingHero';

type LandingPageProps = {
  onEnter: () => void;
  connecting: boolean;
  statusMessage?: string;
  onMissingWallet?: () => void;
};

export default function LandingPage({ onEnter, connecting, statusMessage, onMissingWallet }: LandingPageProps) {
  return (
    <motion.main
      key="landing-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ display: 'grid', gap: '2.5rem' }}
    >
      <NavBar onMissingWallet={onMissingWallet} />
      <LandingHero
        onEnter={onEnter}
        connecting={connecting}
        statusMessage={statusMessage}
      />
    </motion.main>
  );
}
