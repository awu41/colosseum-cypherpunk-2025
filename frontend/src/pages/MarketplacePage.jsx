import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnimatePresence, motion } from 'framer-motion';
import NavBar from '../components/NavBar.jsx';
import MarketplaceGrid from '../components/MarketplaceGrid.jsx';
import { listings } from '../data/listings.js';

const MarketplacePage = () => {
  const { publicKey } = useWallet();
  const [actionFeedback, setActionFeedback] = useState('');

  const handleBuy = useCallback(
    (listing) => {
      setActionFeedback(
        `Buy action queued for ${listing.title} at ${listing.price} ${listing.currency}. (Mock transaction)`
      );
      // TODO: integrate on-chain instruction and transaction confirmation.
      console.info('Buy listing request', { listing, owner: publicKey?.toBase58() });
    },
    [publicKey]
  );

  const handleContact = useCallback((listing) => {
    setActionFeedback(`Contact request sent to ${listing.artist}. (Placeholder interaction)`);
    console.info('Contact artist request', { listing, owner: publicKey?.toBase58() });
  }, [publicKey]);

  useEffect(() => {
    if (!actionFeedback) {
      return undefined;
    }

    const timer = setTimeout(() => setActionFeedback(''), 4000);
    return () => clearTimeout(timer);
  }, [actionFeedback]);

  return (
    <motion.main
      key='marketplace-view'
      initial={{ opacity: 0.2, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ display: 'grid', gap: '2.8rem', paddingBottom: '6rem' }}
    >
      <NavBar showNavLinks={false} />

      <motion.section
        className='island floating'
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut', delay: 0.15 }}
      >
        <div className='marketplace-header'>
          <div>
            <h2 className='marketplace-header__title'>Curated audio islands</h2>
            <p className='marketplace-header__subtitle'>
              Each mint unlocks studio stems, audio-reactive visual packs, and future collab drops. Trade instantly
              on Solana with frictionless wallet flows.
            </p>
          </div>

          <div className='metrics-row'>
            <div className='metric-card'>
              <span className='metric-value'>Devnet</span>
              <span className='metric-label'>Network</span>
              <p style={{ margin: 0, color: 'rgba(227, 229, 236, 0.52)', fontSize: '0.85rem' }}>
                Transactions routed through Solana devnet for testing.
              </p>
            </div>
            <div className='metric-card'>
              <span className='metric-value'>0.0005</span>
              <span className='metric-label'>Est. fees (SOL)</span>
              <p style={{ margin: 0, color: 'rgba(227, 229, 236, 0.52)', fontSize: '0.85rem' }}>
                Low cost execution protected with blockhash freshness checks.
              </p>
            </div>
            <div className='metric-card'>
              <span className='metric-value'>Live</span>
              <span className='metric-label'>Audio previews</span>
              <p style={{ margin: 0, color: 'rgba(227, 229, 236, 0.52)', fontSize: '0.85rem' }}>
                Embedded SoundCloud streams surface artist storytelling instantly.
              </p>
            </div>
          </div>
        </div>

        <MarketplaceGrid listings={listings} onBuy={handleBuy} onContact={handleContact} />
      </motion.section>

      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            key='action-feedback'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35 }}
            className='island'
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              maxWidth: '320px',
              zIndex: 10,
              padding: '1rem 1.25rem',
              borderRadius: '18px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(236, 234, 232, 0.9)' }}>{actionFeedback}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
};

export default MarketplacePage;
