'use client';

import { motion, useCycle } from 'framer-motion';
import { Listing } from '@/data/listings';

type Props = {
  listing: Listing;
  onBuy: (listing: Listing) => void;
  onContact: (listing: Listing) => void;
  isProcessing?: boolean;
};

export default function ListingCard({ listing, onBuy, onContact, isProcessing = false }: Props) {
  const [glimmer, cycleGlimmer] = useCycle(
    { boxShadow: '0 0 0 rgba(236, 192, 66, 0)' },
    { boxShadow: '0 0 22px rgba(236, 192, 66, 0.35)' }
  );

  const buyDisabled =
    isProcessing ||
    !listing.beatHashHex ||
    !listing.beatMint ||
    !listing.termsCid ||
    !listing.licenseType ||
    !listing.territory ||
    !listing.validUntil;

  return (
    <motion.article
      className="island island--glow listing-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      whileHover={{ translateY: -8, transition: { duration: 0.35 } }}
      onHoverStart={() => cycleGlimmer()}
      onHoverEnd={() => cycleGlimmer()}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 20% 20%, rgba(236, 192, 66, 0.05), transparent 60%)`,
          pointerEvents: 'none',
        }}
        animate={glimmer}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />

      <header className="listing-card__header">
        <div>
          <h3 className="listing-card__title">{listing.title}</h3>
          <p className="listing-card__artist">by {listing.artist}</p>
        </div>

        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          style={{
            borderRadius: '999px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.68rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: 'rgba(236, 192, 66, 0.12)',
            border: '1px solid rgba(236, 192, 66, 0.22)',
            color: 'rgba(236, 192, 66, 0.85)',
            textAlign: 'center',
            minWidth: '6.75rem',
            display: 'inline-flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {listing.vibes}
        </motion.span>
      </header>

      <div className="listing-card__player" aria-label={`Audio preview for ${listing.title}`}>
        <iframe
          title={`${listing.title} audio preview`}
          width="100%"
          height="100%"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
            listing.soundcloudUrl
          )}&color=%23ecc042&inverse=false&auto_play=false&show_user=true`}
          style={{ filter: 'contrast(1.05)' }}
        />
      </div>

      <footer className="listing-card__footer">
        <div className="listing-card__price">
          <span className="listing-card__price-label">Current Ask</span>
          <span className="listing-card__price-value">
            {listing.price} {listing.currency}
          </span>
        </div>
        <div className="listing-card__actions">
          <button
            className="pill-button pill-button--ghost"
            type="button"
            onClick={() => onContact(listing)}
            disabled={!listing.telegram}
          >
            Contact
          </button>
          <button
            className="pill-button pill-button--primary"
            type="button"
            onClick={() => onBuy(listing)}
            disabled={buyDisabled}
          >
            {isProcessing ? 'Processing…' : buyDisabled ? 'Unavailable' : 'Buy'}
          </button>
        </div>
      </footer>
    </motion.article>
  );
}
