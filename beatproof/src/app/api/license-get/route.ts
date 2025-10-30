import { z } from 'zod';
import { getProgram } from '@/lib/anchor/program';
import { deriveLicensePda } from '@/lib/solana/pda';
import { NextResponse } from 'next/server';

const Body = z.object({
  beatHashHex: z.string().length(64),
  licensee: z.string(),
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
    
    const { beatHashHex, licensee } = parsed.data;
    
    const program = getProgram();
    const pda = deriveLicensePda(program.programId, beatHashHex, licensee);
    const account = await (program.account as any).license.fetchNullable(pda);
    
    if (!account) {
      return NextResponse.json(
        { error: 'Not found', pda: pda.toBase58() },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      pda: pda.toBase58(),
      account: serializeLicenseAccount(account),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

function serializeLicenseAccount(account: any) {
  const licenseType =
    'exclusive' in account.licenseType ? 'Exclusive' : 'NonExclusive';
  const beatHashArray = Array.isArray(account.beatHash)
    ? account.beatHash
    : Array.from(account.beatHash as Uint8Array);
  const beatHashBytes = Buffer.from(beatHashArray);

  return {
    issuer: account.issuer.toBase58?.() ?? account.issuer,
    licensee: account.licensee.toBase58?.() ?? account.licensee,
    beatMint: account.beatMint.toBase58?.() ?? account.beatMint,
    beatHashHex: beatHashBytes.toString('hex'),
    termsCid: account.termsCid,
    licenseType,
    territory: account.territory,
    validUntil: account.validUntil.toString(),
    revoked: account.revoked,
  };
}
