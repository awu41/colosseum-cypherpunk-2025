import {
  Transaction,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getProgram } from '@/lib/anchor/program';
import { deriveLicenseGuardPda, deriveLicensePda } from './pda';

export type LicenseType = 'Exclusive' | 'NonExclusive';

export interface InitializeLicenseParams {
  beatHashHex: string;
  beatMint: string;
  termsCid: string;
  licenseType: LicenseType;
  territory: string;
  validUntil: bigint;
  issuer: string; // PublicKey as base58 string
  licensee: string; // PublicKey as base58 string
}

export interface RevokeLicenseParams {
  beatHashHex: string;
  issuer: string; // PublicKey as base58 string
  licensee: string; // PublicKey as base58 string
}

/**
 * Build an initialize license instruction
 */
export async function buildInitializeInstruction(
  params: InitializeLicenseParams,
  program = getProgram(),
) {
  const issuerKey = new PublicKey(params.issuer);
  const licenseeKey = new PublicKey(params.licensee);
  const beatMintKey = new PublicKey(params.beatMint);
  const beatHashBytes = Buffer.from(params.beatHashHex, 'hex');
  
  if (beatHashBytes.length !== 32) {
    throw new Error('beatHashHex must be 64 hex chars (32 bytes)');
  }
  
  const licensePda = deriveLicensePda(
    program.programId,
    params.beatHashHex,
    licenseeKey,
  );
  const guardPda = deriveLicenseGuardPda(program.programId, params.beatHashHex);
  const licenseTypeVariant =
    params.licenseType === 'Exclusive'
      ? 'exclusive'
      : params.licenseType === 'NonExclusive'
      ? 'nonExclusive'
      : undefined;

  if (!licenseTypeVariant) {
    throw new Error(`Unsupported license type ${params.licenseType}`);
  }
  
  const ix = await (program.methods as any)
    .initialize(
      Array.from(beatHashBytes),
      licenseeKey,
      beatMintKey,
      params.termsCid,
      { [licenseTypeVariant]: {} },
      params.territory,
      new BN(params.validUntil.toString()),
    )
    .accounts({
      license: licensePda,
      guard: guardPda,
      signer: issuerKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  
  return ix;
}

/**
 * Build a revoke license instruction
 */
export async function buildRevokeInstruction(params: RevokeLicenseParams) {
  const program = getProgram();
  const issuerKey = new PublicKey(params.issuer);
  const licenseeKey = new PublicKey(params.licensee);
  const licensePda = deriveLicensePda(
    program.programId,
    params.beatHashHex,
    licenseeKey,
  );
  const guardPda = deriveLicenseGuardPda(program.programId, params.beatHashHex);
  
  const ix = await (program.methods as any)
    .revoke()
    .accounts({
      license: licensePda,
      guard: guardPda,
      signer: issuerKey,
    })
    .instruction();
  
  return ix;
}

/**
 * Build and serialize a transaction for initialize
 */
export async function buildInitializeTransaction(params: InitializeLicenseParams): Promise<string> {
  const program = getProgram();
  const ix = await buildInitializeInstruction(params, program);
  const tx = new Transaction().add(ix);
  tx.feePayer = new PublicKey(params.issuer);
  const { blockhash } = await program.provider.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');
}

/**
 * Build and serialize a transaction for revoke
 */
export async function buildRevokeTransaction(params: RevokeLicenseParams): Promise<string> {
  const ix = await buildRevokeInstruction(params);
  const tx = new Transaction().add(ix);
  
  // Note: recentBlockhash and feePayer should be set by the client
  // before signing. We return the base64 serialized transaction.
  return tx.serialize({ requireAllSignatures: false }).toString('base64');
}
