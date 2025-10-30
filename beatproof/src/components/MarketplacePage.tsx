'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnimatePresence, motion } from 'framer-motion';
import NavBar from './NavBar';
import MarketplaceGrid from './MarketplaceGrid';
import { Listing, listings as initialListings } from '@/data/listings';

export default function MarketplacePage() {
  const { publicKey } = useWallet();
  const [actionFeedback, setActionFeedback] = useState('');
  const [contactListing, setContactListing] = useState<Listing | null>(null);

  const handleBuy = useCallback((listing: Listing) => {
    setActionFeedback(
      `Buy action queued for ${listing.title} at ${listing.price} ${listing.currency}. (Mock transaction)`
    );
    console.info('Buy listing request', { listing, owner: publicKey?.toBase58() });
  }, [publicKey]);

  const handleContact = useCallback((listing: Listing) => {
    if (!listing.telegram) {
      setActionFeedback('This seller has not added a Telegram yet.');
      return;
    }

    setContactListing(listing);
    console.info('Contact artist request', { listing, owner: publicKey?.toBase58() });
  }, [publicKey]);

  useEffect(() => {
    if (!actionFeedback) {
      return undefined;
    }

    const timer = setTimeout(() => setActionFeedback(''), 4000);
    return () => clearTimeout(timer);
  }, [actionFeedback]);

  const readableTelegram = useMemo(() => {
    if (!contactListing?.telegram) {
      return '';
    }
    const url = contactListing.telegram;
    if (url.startsWith('http')) {
      const handle = url.replace(/^https?:\/\/t\.me\//, '');
      return handle.startsWith('@') ? handle : `@${handle}`;
    }
    return url.startsWith('@') ? url : `@${url}`;
  }, [contactListing]);

  const handleCloseContact = useCallback(() => {
    setContactListing(null);
  }, []);

  return (
    <motion.main
      key='marketplace-view'
      initial={{ opacity: 0.2, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ display: 'grid', gap: '2.8rem', paddingBottom: '6rem' }}
    >
      <NavBar />

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

          <div className='marketplace-header__actions'>
            <Link href='/sell' className='ghost-button'>
              List a Track
            </Link>
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

        <MarketplaceGrid listings={initialListings} onBuy={handleBuy} onContact={handleContact} />
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

      <AnimatePresence>
        {contactListing && (
          <motion.div
            key='contact-island'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35 }}
            className='island contact-island'
            role='dialog'
            aria-labelledby='contact-title'
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <h3 id='contact-title' style={{ margin: 0 }}>
                  Connect with {contactListing.artist}
                </h3>
                <p style={{ margin: '0.35rem 0 0', color: 'rgba(227, 229, 236, 0.7)' }}>
                  DM the artist on Telegram to negotiate directly.
                </p>
              </div>
              <button className='ghost-button ghost-button--dev' type='button' onClick={handleCloseContact}>
                Close
              </button>
            </div>

            <div className='contact-island__body'>
              <div>
                <span className='contact-label'>Track</span>
                <p className='contact-value'>{contactListing.title}</p>
              </div>
              <div>
                <span className='contact-label'>Asking</span>
                <p className='contact-value'>
                  {contactListing.price} {contactListing.currency}
                </p>
              </div>
              {contactListing.telegram && (
                <a
                  className='contact-cta'
                  href={contactListing.telegram}
                  target='_blank'
                  rel='noreferrer'
                >
                  Message {readableTelegram}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
