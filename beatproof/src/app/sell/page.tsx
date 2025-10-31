'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import NavBar from '@/components/NavBar';
import { addCustomListing } from '@/lib/listings/storage';
import type { Listing } from '@/data/listings';

const defaultSellForm = {
  title: '',
  artist: '',
  price: '',
  currency: 'SOL',
  vibes: '',
  soundcloudUrl: '',
  telegram: '',
  notes: '',
  licenseType: 'Exclusive' as 'Exclusive' | 'NonExclusive',
  territory: 'Worldwide',
  validUntil: '',
  terms: '',
};

export default function SellPage() {
  const { publicKey, connected } = useWallet();
  const [form, setForm] = useState(defaultSellForm);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [derivedMetadata, setDerivedMetadata] = useState<{
    beatHashHex: string;
    beatMint: string;
    termsCid: string;
    validUntil: string;
  } | null>(null);

  const programId = useMemo(
    () => new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID ?? 'FYqcZuL5DUBUTTKx94oew8zZoX5rSR8WpEA3RJEXC457'),
    []
  );

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    if (name === 'price') {
      const formatted = value.replace(/[^0-9.]/g, '');
      const parts = formatted.split('.');
      const normalised = parts.length > 2 ? `${parts.shift()}.${parts.join('')}` : formatted;
      setForm((prev) => ({ ...prev, [name]: normalised }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setStatus({ type: 'idle', message: '' });
  }, []);

  const normaliseTelegramLink = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('http')) return trimmed;
    const cleaned = trimmed.replace(/^@/, '');
    return `https://t.me/${cleaned}`;
  }, []);

  const createListing = useCallback(
    (metadata: { beatHashHex: string; beatMint: string; termsCid: string; validUntil: string }): Listing => {
      const id = `${form.title.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
      return {
        id,
        title: form.title.trim(),
        artist: form.artist.trim(),
        price: form.price.trim() || 'N/A',
        currency: form.currency,
        vibes: form.vibes.trim(),
        soundcloudUrl: form.soundcloudUrl.trim(),
        telegram: normaliseTelegramLink(form.telegram),
        notes: form.notes.trim(),
        status: 'available',
        licenseType: form.licenseType,
        territory: form.territory.trim() || 'Worldwide',
        validUntil: metadata.validUntil,
        termsCid: metadata.termsCid,
        beatHashHex: metadata.beatHashHex,
        beatMint: metadata.beatMint,
      };
    },
    [form, normaliseTelegramLink]
  );

  const arrayBufferToHex = (buffer: ArrayBuffer) =>
    Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  const generateMetadata = useCallback(async () => {
    if (!connected || !publicKey) {
      throw new Error('Connect your wallet before generating metadata.');
    }

    if (!form.soundcloudUrl.trim()) {
      throw new Error('SoundCloud URL is required to derive the beat hash.');
    }

    const encoder = new TextEncoder();
    const beatHashInput = `${form.soundcloudUrl.trim()}|${publicKey.toBase58()}`;
    const beatHashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(beatHashInput));
    const beatHashHex = arrayBufferToHex(beatHashBuffer);

    const beatHashBytes = Buffer.from(beatHashHex, 'hex');
    const [beatMint] = PublicKey.findProgramAddressSync(
      [Buffer.from('beat'), publicKey.toBuffer(), beatHashBytes],
      programId
    );

    const termsSource = form.terms.trim() || `${form.title.trim()}|${form.artist.trim()}`;
    const termsHash = await crypto.subtle.digest('SHA-256', encoder.encode(termsSource));
    const termsCid = `demo://${arrayBufferToHex(termsHash)}`;

    const validUntilSeconds = form.validUntil
      ? Math.floor(new Date(form.validUntil).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // default 30 days

    return {
      beatHashHex,
      beatMint: beatMint.toBase58(),
      termsCid,
      validUntil: validUntilSeconds.toString(),
    };
  }, [connected, form.artist, form.soundcloudUrl, form.terms, form.title, form.validUntil, programId, publicKey]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!form.title.trim() || !form.artist.trim() || !form.soundcloudUrl.trim()) {
        setStatus({ type: 'error', message: 'Title, artist, and SoundCloud URL are required.' });
        return;
      }

      try {
        setStatus({ type: 'idle', message: '' });
        const metadata = await generateMetadata();
        const listing = createListing(metadata);
        addCustomListing(listing);
        setDerivedMetadata(metadata);
        console.info('Sell submission stored locally', listing);
        setStatus({ type: 'success', message: `${listing.title} is now visible in the marketplace.` });
        setForm(defaultSellForm);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to generate beat metadata.';
        setStatus({ type: 'error', message });
      }
    },
    [createListing, form.artist, form.soundcloudUrl, form.title, generateMetadata]
  );

  return (
    <motion.main
      key='sell-view'
      initial={{ opacity: 0.2, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ display: 'grid', gap: '2.5rem', paddingBottom: '4rem' }}
    >
      <NavBar />

      <motion.section
        className='island sell-island floating'
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut', delay: 0.15 }}
      >
        <header style={{ display: 'grid', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.01em' }}>Sell your Beatproof release</h1>
              <p style={{ margin: '0.4rem 0 0', color: 'rgba(227, 229, 236, 0.68)' }}>
                Connect your wallet, drop a SoundCloud preview, and we&apos;ll derive the beat hash, mint address, and terms CID
                automatically so collectors can mint the license on-chain.
              </p>
            </div>
            <Link href='/' className='ghost-button'>
              Back
            </Link>
          </div>
        </header>

        <form className='sell-form' onSubmit={handleSubmit}>
          <div className='sell-form__grid'>
            <label className='form-field'>
              <span>Track title *</span>
              <input name='title' value={form.title} onChange={handleChange} placeholder='E.g. Lunar Bloom' required />
            </label>
            <label className='form-field'>
              <span>Artist *</span>
              <input name='artist' value={form.artist} onChange={handleChange} placeholder='Your alias' required />
            </label>
            <label className='form-field'>
              <span>Price</span>
              <input name='price' value={form.price} onChange={handleChange} placeholder='12.5' inputMode='decimal' />
            </label>
            <label className='form-field'>
              <span>Currency</span>
              <select name='currency' value={form.currency} onChange={handleChange}>
                <option value='SOL'>SOL</option>
                <option value='USDC'>USDC</option>
              </select>
            </label>
            <label className='form-field'>
              <span>Vibes / Genre</span>
              <input name='vibes' value={form.vibes} onChange={handleChange} placeholder='ambient, glitch soul…' />
            </label>
            <label className='form-field form-field--wide'>
              <span>SoundCloud track URL *</span>
              <input
                name='soundcloudUrl'
                value={form.soundcloudUrl}
                onChange={handleChange}
                placeholder='https://soundcloud.com/...'
                required
              />
            </label>
            <label className='form-field'>
              <span>Telegram contact</span>
              <input
                name='telegram'
                value={form.telegram}
                onChange={handleChange}
                placeholder='@beatproofArtist or https://t.me/beatproofArtist'
              />
            </label>
            <label className='form-field form-field--wide'>
              <span>Collector notes</span>
              <textarea
                name='notes'
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder='Rights, stems, or unlockables included with this drop.'
              />
            </label>
            <label className='form-field'>
              <span>License type</span>
              <select name='licenseType' value={form.licenseType} onChange={handleChange}>
                <option value='Exclusive'>Exclusive</option>
                <option value='NonExclusive'>Non Exclusive</option>
              </select>
            </label>
            <label className='form-field'>
              <span>Territory</span>
              <input
                name='territory'
                value={form.territory}
                onChange={handleChange}
                placeholder='Worldwide'
              />
            </label>
            <label className='form-field'>
              <span>License valid until</span>
              <input
                type='datetime-local'
                name='validUntil'
                value={form.validUntil}
                onChange={handleChange}
              />
            </label>
            <label className='form-field form-field--wide'>
              <span>Terms / Unlockables (used to derive CID)</span>
              <textarea
                name='terms'
                value={form.terms}
                onChange={handleChange}
                rows={3}
                placeholder='Describe the rights, stems, or unlockables included.'
              />
            </label>
          </div>

          {derivedMetadata && (
            <div className='sell-derived'>
              <h3>Generated contract metadata</h3>
              <ul>
                <li><strong>Beat hash</strong>: <code>{derivedMetadata.beatHashHex}</code></li>
                <li><strong>Beat mint</strong>: <code>{derivedMetadata.beatMint}</code></li>
                <li><strong>Terms CID</strong>: <code>{derivedMetadata.termsCid}</code></li>
                <li><strong>Valid until (unix)</strong>: {derivedMetadata.validUntil}</li>
              </ul>
              <p style={{ marginTop: '0.5rem', color: 'rgba(227, 229, 236, 0.68)' }}>
                These values are automatically passed to the on-chain license transaction when a collector buys this beat.
              </p>
            </div>
          )}

          <div className='sell-form__footer'>
            <button className='pill-button pill-button--primary' type='submit'>
              Submit Listing
            </button>
            {!connected && (
              <span className='sell-form__status sell-form__status--error' role='status' aria-live='polite'>
                Connect your wallet to generate beat metadata.
              </span>
            )}
            {status.type !== 'idle' && (
              <span
                className={`sell-form__status sell-form__status--${status.type}`}
                role='status'
                aria-live='polite'
              >
                {status.message}
              </span>
            )}
          </div>
        </form>
      </motion.section>
    </motion.main>
  );
}
