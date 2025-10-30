import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getProgram } from "../lib/anchor/program";
import { deriveLicensePda } from "../lib/solana/pda";

const Body = z.object({ beatHashHex: z.string().length(64) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  const { beatHashHex } = parsed.data;

  try {
    const program = getProgram();
    const pda = deriveLicensePda(program.programId, beatHashHex);
    const account = await program.account.license.fetchNullable(pda);
    if (!account) return res.status(404).json({ error: "Not found", pda: pda.toBase58() });
    return res.status(200).json({ pda: pda.toBase58(), account });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
}


