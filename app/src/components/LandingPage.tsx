'use client';

import { motion } from 'framer-motion';
import NavBar from './NavBar';
import LandingHero from './LandingHero';

export default function LandingPage({ onDevExplore }: { onDevExplore?: () => void }) {
  return (
    <motion.main
      key="landing-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ display: 'grid', gap: '2.5rem' }}
    >
      <NavBar />
      <LandingHero onDevExplore={onDevExplore} />
    </motion.main>
  );
}

