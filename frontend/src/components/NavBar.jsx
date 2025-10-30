import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import ConnectWalletButton from './ConnectWalletButton.jsx';

const shortenAddress = (value) => {
  if (!value) return '';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
};

const NavBar = ({ showNavLinks = true, devMode = false, onExitDev }) => {
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
        {devMode && (
          <span className="wallet-tag wallet-tag--dev" aria-live="polite">
            <span className="wallet-tag__dot" />
            Dev Preview
          </span>
        )}
        {walletAddress && (
          <span className="wallet-tag" aria-live="polite">
            <span className="wallet-tag__dot" />
            {shortenAddress(walletAddress)}
          </span>
        )}
        {devMode && !walletAddress && onExitDev && (
          <button className="ghost-button ghost-button--dev" type="button" onClick={onExitDev}>
            Exit Dev Mode
          </button>
        )}
        <ConnectWalletButton />
      </div>
    </motion.header>
  );
};

export default NavBar;
