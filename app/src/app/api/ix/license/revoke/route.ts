import { z } from 'zod';
import { buildRevokeTransaction } from '@/lib/solana/builders';
import { NextResponse } from 'next/server';

const Body = z.object({
  beatHashHex: z.string().length(64),
  issuer: z.string(), // PublicKey as base58
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
    
    const { beatHashHex, issuer } = parsed.data;
    
    const txBase64 = await buildRevokeTransaction({
      beatHashHex,
      issuer,
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

