import { z } from 'zod';
import { getProgram } from '@/lib/anchor/program';
import { deriveLicensePda } from '@/lib/solana/pda';
import { requireWalletFromSession, WalletSessionError } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

const Body = z.object({
  beatHashHex: z.string().length(64),
  licensee: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    let sessionLicensee: string | undefined;
    try {
      sessionLicensee = requireWalletFromSession();
    } catch (sessionError) {
      if (!(sessionError instanceof WalletSessionError)) {
        throw sessionError;
      }
      // Defer error until after parsing in case licensee provided explicitly
    }

    const body = await request.json();
    const parsed = Body.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const { beatHashHex, licensee } = parsed.data;

    if (!licensee && !sessionLicensee) {
      return NextResponse.json(
        { error: 'Licensee not provided and wallet session missing' },
        { status: 401 }
      );
    }
    
    if (licensee && sessionLicensee && licensee !== sessionLicensee) {
      return NextResponse.json(
        { error: 'Licensee does not match active wallet session' },
        { status: 403 }
      );
    }
    
    const effectiveLicensee = licensee ?? sessionLicensee!;
    
    const program = getProgram();
    const pda = deriveLicensePda(program.programId, beatHashHex, effectiveLicensee);
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
