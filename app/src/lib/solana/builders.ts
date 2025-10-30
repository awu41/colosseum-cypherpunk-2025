import { 
  Transaction,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getProgram } from '@/lib/anchor/program';
import { deriveLicensePda } from './pda';

export type LicenseType = 'Exclusive' | 'NonExclusive';

export interface InitializeLicenseParams {
  beatHashHex: string;
  termsCid: string;
  licenseType: LicenseType;
  territory: string;
  validUntil: bigint;
  issuer: string; // PublicKey as base58 string
}

export interface RevokeLicenseParams {
  beatHashHex: string;
  issuer: string; // PublicKey as base58 string
}

/**
 * Build an initialize license instruction
 */
export function buildInitializeInstruction(params: InitializeLicenseParams) {
  const program = getProgram();
  const issuerKey = new PublicKey(params.issuer);
  const beatHashBytes = Buffer.from(params.beatHashHex, 'hex');
  
  if (beatHashBytes.length !== 32) {
    throw new Error('beatHashHex must be 64 hex chars (32 bytes)');
  }
  
  const licensePda = deriveLicensePda(program.programId, params.beatHashHex);
  
  const ix = program.methods
    .initialize(
      Array.from(beatHashBytes),
      params.termsCid,
      { [params.licenseType]: {} },
      params.territory,
      new BN(params.validUntil.toString())
    )
    .accounts({
      license: licensePda,
      signer: issuerKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  
  return ix;
}

/**
 * Build a revoke license instruction
 */
export function buildRevokeInstruction(params: RevokeLicenseParams) {
  const program = getProgram();
  const issuerKey = new PublicKey(params.issuer);
  const licensePda = deriveLicensePda(program.programId, params.beatHashHex);
  
  const ix = program.methods
    .revoke()
    .accounts({
      license: licensePda,
      signer: issuerKey,
    })
    .instruction();
  
  return ix;
}

/**
 * Build and serialize a transaction for initialize
 */
export function buildInitializeTransaction(params: InitializeLicenseParams): string {
  const ix = buildInitializeInstruction(params);
  const tx = new Transaction().add(ix);
  
  // Note: recentBlockhash and feePayer should be set by the client
  // before signing. We return the base64 serialized transaction.
  return tx.serialize({ requireAllSignatures: false }).toString('base64');
}

/**
 * Build and serialize a transaction for revoke
 */
export function buildRevokeTransaction(params: RevokeLicenseParams): string {
  const ix = buildRevokeInstruction(params);
  const tx = new Transaction().add(ix);
  
  // Note: recentBlockhash and feePayer should be set by the client
  // before signing. We return the base64 serialized transaction.
  return tx.serialize({ requireAllSignatures: false }).toString('base64');
}

