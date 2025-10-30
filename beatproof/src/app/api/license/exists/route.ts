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
    
    return NextResponse.json({ exists: account !== null });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
