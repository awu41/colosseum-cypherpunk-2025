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
    
    return NextResponse.json({ exists: account !== null });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
