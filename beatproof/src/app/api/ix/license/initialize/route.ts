import { z } from 'zod';
import { buildInitializeTransaction } from '@/lib/solana/builders';
import { requireWalletFromSession, WalletSessionError } from '@/lib/auth/session';
import { NextResponse } from 'next/server';
import idl from '@/idl/soundcloud_license.json';

const Body = z.object({
  beatHashHex: z.string().length(64),
  beatMint: z.string(),
  termsCid: z.string(),
  licenseType: z.enum(['Exclusive', 'NonExclusive']),
  territory: z.string(),
  validUntil: z.string().or(z.number()).transform((val) => BigInt(val)),
});

export async function POST(request: Request) {
  try {
    let walletAddress: string;
    try {
      walletAddress = requireWalletFromSession();
    } catch (sessionError) {
      if (sessionError instanceof WalletSessionError) {
        return NextResponse.json({ error: sessionError.message }, { status: sessionError.status });
      }
      throw sessionError;
    }

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
    } = parsed.data;

    console.info('[initialize-license] payload', {
      beatHashHex,
      beatMint,
      termsCid,
      licenseType,
      territory,
      validUntil,
      walletAddress,
    });

    console.info('[initialize-license] idl', idl);
    const txBase64 = await buildInitializeTransaction({
      beatHashHex,
      beatMint,
      termsCid,
      licenseType,
      territory,
      validUntil,
      issuer: walletAddress,
      licensee: walletAddress,
    });

    try {
      const { Transaction } = await import('@solana/web3.js');
      const tx = Transaction.from(Buffer.from(txBase64, 'base64'));
      console.info('[initialize-license] built transaction summary', {
        feePayer: tx.feePayer?.toBase58(),
        recentBlockhash: tx.recentBlockhash,
        lastValidBlockHeight: tx.lastValidBlockHeight,
        instructions: tx.instructions.length,
      });
    } catch (logError) {
      console.warn('[initialize-license] unable to decode transaction for logging', logError);
    }

    console.info('[initialize-license] transaction payload meta', {
      base64Length: txBase64.length,
      base64Preview: txBase64.slice(0, 128),
    });
    
    return NextResponse.json({
      transaction: txBase64,
      note: 'Transaction must be signed and sent by the client. Set recentBlockhash and feePayer before signing.',
    });
  } catch (e: any) {
    console.error('[initialize-license] error', e);
    return NextResponse.json(
      { error: e?.message || 'Unknown error', stack: e?.stack },
      { status: 500 }
    );
  }
}
