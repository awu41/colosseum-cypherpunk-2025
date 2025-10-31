'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NavBar from '@/components/NavBar';

type LicenseResponse = {
  pda: string;
  account: {
    issuer: string;
    licensee: string;
    beatMint: string;
    beatHashHex: string;
    termsCid: string;
    licenseType: 'Exclusive' | 'NonExclusive';
    territory: string;
    validUntil: string;
    revoked: boolean;
  };
};

export default function InspectLicensePage() {
  const [beatHash, setBeatHash] = useState('');
  const [licensee, setLicensee] = useState('');
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<LicenseResponse | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('');
    setResult(null);

    if (!beatHash || beatHash.length !== 64) {
      setStatus('Provide a 64-character beat hash.');
      return;
    }

    try {
      const response = await fetch('/api/license-get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ beatHashHex: beatHash, licensee: licensee || undefined }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'License not found');
      }

      const json = (await response.json()) as LicenseResponse;
      setResult(json);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to fetch license.');
    }
  };

  return (
    <motion.main
      key='inspect-license'
      initial={{ opacity: 0.2, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{ display: 'grid', gap: '2.5rem', paddingBottom: '4rem' }}
    >
      <NavBar />

      <motion.section
        className='island floating'
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0 }}>Inspect an on-chain license</h1>
            <p style={{ marginTop: '0.35rem', color: 'rgba(227, 229, 236, 0.68)' }}>
              Paste the beat hash (and optional licensee) to view the PDA stored by the Beatproof program.
            </p>
          </div>
          <Link href='/' className='ghost-button'>Back</Link>
        </header>

        <form className='sell-form' onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div className='sell-form__grid'>
            <label className='form-field form-field--wide'>
              <span>Beat hash (hex)</span>
              <input
                name='beatHash'
                value={beatHash}
                onChange={(event) => setBeatHash(event.target.value.trim())}
                placeholder='64-character beat hash'
                required
              />
            </label>
            <label className='form-field form-field--wide'>
              <span>Licensee wallet (optional)</span>
              <input
                name='licensee'
                value={licensee}
                onChange={(event) => setLicensee(event.target.value.trim())}
                placeholder='Wallet address'
              />
            </label>
          </div>

          <div className='sell-form__footer'>
            <button className='pill-button pill-button--primary' type='submit'>Lookup</button>
            {status && (
              <span className='sell-form__status sell-form__status--error' role='status' aria-live='polite'>
                {status}
              </span>
            )}
          </div>
        </form>

        {result && (
          <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
            <div>
              <span className='contact-label'>Program Derived Address</span>
              <p className='contact-value' style={{ wordBreak: 'break-all' }}>{result.pda}</p>
            </div>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <details open>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Account JSON</summary>
                <pre
                  style={{
                    background: 'rgba(12, 16, 24, 0.6)',
                    padding: '1rem',
                    borderRadius: '16px',
                    overflowX: 'auto',
                    margin: 0,
                  }}
                >
                  {JSON.stringify(result.account, null, 2)}
                </pre>
              </details>
            </div>
            <Link
              href={`https://explorer.solana.com/address/${result.pda}?cluster=devnet`}
              target='_blank'
              rel='noreferrer'
              className='pill-button pill-button--ghost'
              style={{ justifySelf: 'flex-start' }}
            >
              View on Solana Explorer
            </Link>
          </div>
        )}
      </motion.section>
    </motion.main>
  );
}
