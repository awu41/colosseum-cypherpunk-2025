import { PublicKey } from '@solana/web3.js';

export function deriveLicensePda(
  programId: PublicKey,
  beatHashHex: string,
  licensee: string | PublicKey,
): PublicKey {
  const beatHashBytes = Buffer.from(beatHashHex, 'hex');
  if (beatHashBytes.length !== 32) {
    throw new Error('beatHashHex must be 64 hex chars (32 bytes)');
  }
  const licenseeKey =
    typeof licensee === 'string' ? new PublicKey(licensee) : licensee;
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('license'), beatHashBytes, licenseeKey.toBuffer()],
    programId,
  );
  return pda;
}

export function deriveLicenseGuardPda(
  programId: PublicKey,
  beatHashHex: string,
): PublicKey {
  const beatHashBytes = Buffer.from(beatHashHex, 'hex');
  if (beatHashBytes.length !== 32) {
    throw new Error('beatHashHex must be 64 hex chars (32 bytes)');
  }
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('license_guard'), beatHashBytes],
    programId,
  );
  return pda;
}

