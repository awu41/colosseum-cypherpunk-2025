'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
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
};

export default function SellPage() {
  const [form, setForm] = useState(defaultSellForm);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setStatus({ type: 'idle', message: '' });
  }, []);

  const normaliseTelegramLink = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('http')) return trimmed;
    const cleaned = trimmed.replace(/^@/, '');
    return `https://t.me/${cleaned}`;
  }, []);

  const createListing = useCallback((): Listing => {
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
    };
  }, [form, normaliseTelegramLink]);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.artist.trim() || !form.soundcloudUrl.trim()) {
      setStatus({ type: 'error', message: 'Title, artist, and SoundCloud URL are required.' });
      return;
    }

    const listing = createListing();
    addCustomListing(listing);
    console.info('Sell submission stored locally', listing);
    setStatus({ type: 'success', message: `${listing.title} is now visible in the marketplace.` });
    setForm(defaultSellForm);
  }, [createListing, form]);

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
                Drop a SoundCloud preview, set your ask, and leave a Telegram handle so collectors can reach you directly.
                This flow is mock-only for now; no on-chain transactions yet.
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
          </div>

          <div className='sell-form__footer'>
            <button className='pill-button pill-button--primary' type='submit'>
              Submit Listing
            </button>
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
