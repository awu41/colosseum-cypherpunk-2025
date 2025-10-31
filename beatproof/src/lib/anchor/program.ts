import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "@/idl/soundcloud_license.json";

export function getProgram() {
  const rpcUrl = process.env.ANCHOR_PROVIDER_URL || "https://api.devnet.solana.com";
  const programIdStr = process.env.PROGRAM_ID || (idl as any).address;
  const connection = new Connection(rpcUrl, "confirmed");
  const provider = new anchor.AnchorProvider(connection, {} as any, {});
  const programId = new PublicKey(programIdStr);
  const idlWithAddress = { ...(idl as any), address: programId.toBase58() };
  // @ts-ignore anchor.Program accepts Typed or any IDL shape
  const program = new anchor.Program(idlWithAddress as any, provider);
  return program;
}

