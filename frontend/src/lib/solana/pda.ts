import { PublicKey } from "@solana/web3.js";

export function deriveLicensePda(programId: PublicKey, beatHashHex: string): PublicKey {
  const beatHashBytes = Buffer.from(beatHashHex, "hex");
  if (beatHashBytes.length !== 32) {
    throw new Error("beatHashHex must be 64 hex chars (32 bytes)");
  }
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("license"), beatHashBytes],
    programId
  );
  return pda;
}


