'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection, Transaction } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import NavBar from './NavBar';
import MarketplaceGrid from './MarketplaceGrid';
import { Listing, listings as initialListings } from '@/data/listings';
import { loadCustomListings } from '@/lib/listings/storage';
import { fetchLicenseAccount } from '@/lib/licenses/api';

export default function MarketplacePage() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [actionFeedback, setActionFeedback] = useState('');
  const [contactListing, setContactListing] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [viewingListing, setViewingListing] = useState<Listing | null>(null);
  const [licenseDetails, setLicenseDetails] = useState<any>(null);
  const [loadingLicense, setLoadingLicense] = useState(false);

  const connection = useMemo(() => new Connection(clusterApiUrl('devnet'), 'confirmed'), []);

  useEffect(() => {
    const custom = loadCustomListings();
    if (custom.length) {
      setListings((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const merged = [...custom.filter((item) => !existingIds.has(item.id)), ...prev];
        return merged;
      });
    }
  }, []);

  const handleBuy = useCallback(async (listing: Listing) => {
    if (!connected || !publicKey) {
      setActionFeedback('Connect your Phantom wallet to purchase.');
      return;
    }

    if (!listing.beatHashHex || !listing.beatMint || !listing.termsCid || !listing.licenseType || !listing.territory || !listing.validUntil) {
      setActionFeedback('This listing is not yet ready for on-chain minting.');
      return;
    }

    let preparedTx: Transaction | null = null;
    try {
      setBuyingId(listing.id);
      setActionFeedback('Preparing transaction…');
      console.info('[buy] listing metadata', listing);

      if (listing.mock) {
        const mockSignature = `DEMO-${Date.now().toString(16).toUpperCase()}`;
        setActionFeedback(`License minted! Signature ${mockSignature.slice(0, 8)}…`);
        console.info('[buy] mock mint success', { listing, signature: mockSignature });
        return;
      }

      const response = await fetch('/api/ix/license/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beatHashHex: listing.beatHashHex,
          beatMint: listing.beatMint,
          termsCid: listing.termsCid,
          licenseType: listing.licenseType,
          territory: listing.territory,
          validUntil: listing.validUntil,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to build transaction');
      }

      const payload = await response.json();

      if (!payload.transaction && payload.mock) {
        const mockSignature: string = payload.mockSignature || 'MOCK_SIGNATURE';
        setActionFeedback(`License minted! Signature ${mockSignature.slice(0, 8)}…`);
        console.info('Mock license minted', { listing, signature: mockSignature });
        return;
      }

      const { transaction } = payload;

      const tx = Transaction.from(Buffer.from(transaction, 'base64'));
      preparedTx = tx;

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);
      console.info('[buy] submitted signature', signature);

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        'confirmed'
      );

      setActionFeedback(`License minted! Signature ${signature.slice(0, 8)}…`);
      console.info('License minted', { listing, signature });
    } catch (error) {
      console.error('Buy listing failed', error);

      let detailedMessage = error instanceof Error ? error.message : 'Failed to process transaction.';

      const walletErrorLogs = (error as any)?.logs;
      if (Array.isArray(walletErrorLogs) && walletErrorLogs.length) {
        detailedMessage = walletErrorLogs.join('\n');
        console.error('Program logs:', walletErrorLogs);
      } else if (preparedTx) {
        try {
          const legacySimTx = preparedTx as any; // legacy Transaction API
          const simulation = await connection.simulateTransaction(legacySimTx, {
            sigVerify: false,
            commitment: 'processed',
          });
          if (simulation.value.err) {
            detailedMessage = JSON.stringify(simulation.value.err);
            console.error('Simulation error', simulation.value);
          } else if (simulation.value.logs) {
            detailedMessage = simulation.value.logs.join('\n');
            console.error('Simulation logs', simulation.value.logs);
          }
        } catch (simError) {
          console.error('Simulation failed', simError);
        }
      }

      console.error('Buy listing detailed error', detailedMessage);
      setActionFeedback('');
    } finally {
      setBuyingId(null);
    }
  }, [connected, connection, publicKey, sendTransaction]);

  const handleContact = useCallback((listing: Listing) => {
    if (!listing.telegram) {
      setActionFeedback('This seller has not added a Telegram yet.');
      return;
    }

    setContactListing(listing);
    console.info('Contact artist request', { listing, owner: publicKey?.toBase58() });
  }, [publicKey]);

  const handleViewLicense = useCallback(async (listing: Listing) => {
    if (!listing.beatHashHex) {
      setActionFeedback('Listing missing beat hash metadata.');
      return;
    }

    try {
      setViewingListing(listing);
      setLoadingLicense(true);
      const details = await fetchLicenseAccount(listing, publicKey?.toBase58());
      setLicenseDetails(details);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'Unable to load license.';
      const friendly = rawMessage.includes('Not found')
        ? 'No license account found for this wallet. Mint the license first or connect the purchasing wallet.'
        : rawMessage.includes('Cannot read properties')
        ? 'No active license exists yet. Mint the license before viewing details.'
        : rawMessage;
      setLicenseDetails({ error: friendly });
    } finally {
      setLoadingLicense(false);
    }
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

        <MarketplaceGrid
          listings={listings}
          onBuy={handleBuy}
          onContact={handleContact}
          onViewLicense={handleViewLicense}
          buyingId={buyingId}
        />
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
            {actionFeedback.startsWith('License minted!') && (
              <Link
                href={`https://explorer.solana.com/tx/${actionFeedback.split(' ').pop()?.replace('…', '')}?cluster=devnet`}
                className='pill-button pill-button--ghost'
                style={{ marginTop: '0.7rem', display: 'inline-block' }}
                target='_blank'
                rel='noreferrer'
              >
                View on Explorer
              </Link>
            )}
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

      <AnimatePresence>
        {viewingListing && (
          <motion.div
            key='license-details'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35 }}
            className='island contact-island'
            role='dialog'
            aria-labelledby='license-title'
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <h3 id='license-title' style={{ margin: 0 }}>
                  License details
                </h3>
                <p style={{ margin: '0.35rem 0 0', color: 'rgba(227, 229, 236, 0.7)' }}>
                  On-chain record for {viewingListing.title}
                </p>
              </div>
              <button className='ghost-button ghost-button--dev' type='button' onClick={() => setViewingListing(null)}>
                Close
              </button>
            </div>

            <div className='contact-island__body' style={{ gap: '1rem' }}>
              {loadingLicense ? (
                <p>Loading license account…</p>
              ) : licenseDetails?.error ? (
                <p style={{ color: '#f6a6a6', margin: 0 }}>{licenseDetails.error}</p>
              ) : (
                <>
                  <div>
                    <span className='contact-label'>PDA</span>
                    <p className='contact-value' style={{ wordBreak: 'break-all' }}>{licenseDetails?.pda}</p>
                  </div>
                  <div>
                    <span className='contact-label'>Issuer</span>
                    <p className='contact-value'>{licenseDetails?.issuer}</p>
                  </div>
                  <div>
                    <span className='contact-label'>Licensee</span>
                    <p className='contact-value'>{licenseDetails?.licensee}</p>
                  </div>
                  <div>
                    <span className='contact-label'>Beat Mint</span>
                    <p className='contact-value' style={{ wordBreak: 'break-all' }}>{licenseDetails?.beatMint}</p>
                  </div>
                  <div>
                    <span className='contact-label'>License Type</span>
                    <p className='contact-value'>{licenseDetails?.licenseType}</p>
                  </div>
                  <div>
                    <span className='contact-label'>Territory</span>
                    <p className='contact-value'>{licenseDetails?.territory}</p>
                  </div>
                  <div>
                    <span className='contact-label'>Valid Until</span>
                    <p className='contact-value'>{licenseDetails?.validUntil}</p>
                  </div>
                  <div>
                    <span className='contact-label'>Status</span>
                    <p className='contact-value'>{licenseDetails?.revoked ? 'Revoked' : 'Active'}</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
