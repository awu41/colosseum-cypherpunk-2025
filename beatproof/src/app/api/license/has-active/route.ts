import { z } from 'zod';
import { getProgram } from '@/lib/anchor/program';
import { deriveLicensePda } from '@/lib/solana/pda';
import { requireWalletFromSession, WalletSessionError } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

const Body = z.object({ 
  beatHashHex: z.string().length(64),
  licensee: z.string().optional(),
  territory: z.string().optional(),
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
    }

    const body = await request.json();
    const parsed = Body.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const { beatHashHex, licensee, territory } = parsed.data;

    if (!licensee && !sessionLicensee) {
      return NextResponse.json(
        { active: false, reason: 'unauthorized' },
        { status: 401 }
      );
    }

    if (licensee && sessionLicensee && licensee !== sessionLicensee) {
      return NextResponse.json(
        { active: false, reason: 'forbidden' },
        { status: 403 }
      );
    }

    const effectiveLicensee = licensee ?? sessionLicensee!;
    
    const program = getProgram();
    const pda = deriveLicensePda(program.programId, beatHashHex, effectiveLicensee);
    const account = await (program.account as any).license.fetchNullable(pda);
    
    if (!account) {
      return NextResponse.json({ active: false, reason: 'not_found' });
    }
    
    // Check if revoked
    if (account.revoked) {
      return NextResponse.json({ active: false, reason: 'revoked' });
    }
    
    // Check if expired
    const now = BigInt(Date.now() / 1000);
    const validUntil = BigInt(account.validUntil.toString());
    if (validUntil < now) {
      return NextResponse.json({ active: false, reason: 'expired' });
    }
    
    // Check territory if provided
    if (territory && account.territory !== territory) {
      return NextResponse.json({ active: false, reason: 'territory_mismatch' });
    }

    const licenseType =
      'exclusive' in account.licenseType ? 'Exclusive' : 'NonExclusive';
    
    return NextResponse.json({
      active: true,
      licenseType,
      validUntil: validUntil.toString(),
      territory: account.territory,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
