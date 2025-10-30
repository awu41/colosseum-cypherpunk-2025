import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next/headers', () => {
  return {
    cookies: vi.fn(),
  };
});

import { cookies } from 'next/headers';
import { requireWalletFromSession, WalletSessionError } from './session';
import { PublicKey } from '@solana/web3.js';

type CookieValue = { value: string } | undefined;

const mockedCookies = cookies as unknown as vi.Mock;

describe('requireWalletFromSession', () => {
  let cookieStore: Record<string, CookieValue>;

  beforeEach(() => {
    cookieStore = {};
    mockedCookies.mockImplementation(() => ({
      get: (name: string) => cookieStore[name],
    }));
  });

  afterEach(() => {
    mockedCookies.mockReset();
  });

  it('reads the current session cookie', () => {
    const pubkey = new PublicKey('6MXsTdzFpLTnNu1Sb5NVMSksLT9TP9WKsHBk7jm6vG2P').toBase58();
    cookieStore['beatproof-session'] = { value: pubkey };

    const result = requireWalletFromSession();
    expect(result).toBe(pubkey);
  });

  it('falls back to legacy cookie name', () => {
    const pubkey = new PublicKey('C5iEYVbSdug3B74kV6Zz6QvsBSEr9JZ6hq1zgFquMJhr').toBase58();
    cookieStore['beatproof_wallet'] = { value: pubkey };

    const result = requireWalletFromSession();
    expect(result).toBe(pubkey);
  });

  it('throws when no wallet session is present', () => {
    expect(() => requireWalletFromSession()).toThrowError(WalletSessionError);
  });

  it('rejects invalid public keys', () => {
    cookieStore['beatproof-session'] = { value: 'not-a-public-key' };

    expect(() => requireWalletFromSession()).toThrowError(
      new WalletSessionError('Wallet session invalid'),
    );
  });
});

