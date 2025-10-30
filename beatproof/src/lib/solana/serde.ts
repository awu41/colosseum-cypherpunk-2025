import { Transaction } from '@solana/web3.js';

/**
 * Deserialize a base64 transaction string
 */
export function deserializeTransaction(base64: string): Transaction {
  const buffer = Buffer.from(base64, 'base64');
  return Transaction.from(buffer);
}

/**
 * Serialize a transaction to base64
 */
export function serializeTransaction(tx: Transaction): string {
  return tx.serialize({ requireAllSignatures: false }).toString('base64');
}

/**
 * Serialize any buffer to base64
 */
export function toBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

/**
 * Deserialize base64 to buffer
 */
export function fromBase64(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

