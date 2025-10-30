import { z } from 'zod';
import { buildInitializeTransaction } from '@/lib/solana/builders';
import { NextResponse } from 'next/server';

const Body = z.object({
  beatHashHex: z.string().length(64),
  beatMint: z.string(),
  termsCid: z.string(),
  licenseType: z.enum(['Exclusive', 'NonExclusive']),
  territory: z.string(),
  validUntil: z.string().or(z.number()).transform((val) => BigInt(val)),
  issuer: z.string(), // PublicKey as base58
  licensee: z.string(), // PublicKey as base58
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = Body.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const {
      beatHashHex,
      beatMint,
      termsCid,
      licenseType,
      territory,
      validUntil,
      issuer,
      licensee,
    } = parsed.data;
    
    const txBase64 = await buildInitializeTransaction({
      beatHashHex,
      beatMint,
      termsCid,
      licenseType,
      territory,
      validUntil,
      issuer,
      licensee,
    });
    
    return NextResponse.json({
      transaction: txBase64,
      note: 'Transaction must be signed and sent by the client. Set recentBlockhash and feePayer before signing.',
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
