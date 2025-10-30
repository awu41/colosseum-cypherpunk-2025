import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import ConnectWalletButton from './ConnectWalletButton.jsx';

const shortenAddress = (value) => {
  if (!value) return '';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
};

const NavBar = ({ showNavLinks = true }) => {
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
        <span className="brand__mark" />
        <span>Solara Soundscapes</span>
      </div>

      {showNavLinks && (
        <div className="nav-links" role="navigation" aria-label="Primary">
          <span>Explore</span>
          <span>Artists</span>
          <span>Insights</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {walletAddress && (
          <span className="wallet-tag" aria-live="polite">
            <span className="wallet-tag__dot" />
            {shortenAddress(walletAddress)}
          </span>
        )}
        <ConnectWalletButton />
      </div>
    </motion.header>
  );
};

export default NavBar;
