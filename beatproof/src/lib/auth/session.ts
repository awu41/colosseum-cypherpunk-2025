import { cookies } from 'next/headers';
import { PublicKey } from '@solana/web3.js';

export const WALLET_COOKIE_NAME = 'beatproof_wallet';

export class WalletSessionError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = 'WalletSessionError';
    this.status = status;
  }
}

export function requireWalletFromSession(): string {
  const cookieStore = cookies();
  const value = cookieStore.get(WALLET_COOKIE_NAME)?.value;

  if (!value) {
    throw new WalletSessionError('Wallet session not found');
  }

  try {
    // Validate it is a real public key string
    new PublicKey(value);
  } catch (err) {
    throw new WalletSessionError('Wallet session invalid');
  }

  return value;
}

