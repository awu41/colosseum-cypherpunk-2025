import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getProgram } from '@/lib/anchor/program';
import { deriveLicenseGuardPda } from '@/lib/solana/pda';

const Body = z.object({
  beatHashHex: z.string().length(64),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = Body.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { beatHashHex } = parsed.data;
    const program = getProgram();
    const guardPda = deriveLicenseGuardPda(program.programId, beatHashHex);
    const account = await (program.account as any).licenseGuard.fetchNullable(
      guardPda,
    );

    if (!account) {
      return NextResponse.json({
        exists: false,
        exclusiveActive: false,
        pda: guardPda.toBase58(),
      });
    }

    const beatHashArray = Array.isArray(account.beatHash)
      ? account.beatHash
      : Array.from(account.beatHash as Uint8Array);

    return NextResponse.json({
      exists: true,
      exclusiveActive: account.exclusiveActive,
      beatHash: Buffer.from(beatHashArray).toString('hex'),
      pda: guardPda.toBase58(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unexpected error' },
      { status: 500 },
    );
  }
}
