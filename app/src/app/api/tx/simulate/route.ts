import { z } from 'zod';
import { getProgram } from '@/lib/anchor/program';
import { deserializeTransaction } from '@/lib/solana/serde';
import { NextResponse } from 'next/server';

const Body = z.object({
  txBase64: z.string(),
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
    
    const { txBase64 } = parsed.data;
    
    // Deserialize the transaction
    const tx = deserializeTransaction(txBase64);
    
    // Get connection from program
    const program = getProgram();
    const connection = program.provider.connection;
    
    // Simulate the transaction
    const simulation = await connection.simulateTransaction(tx, {
      replaceRecentBlockhash: true,
      sigVerify: false,
    });
    
    if (simulation.value.err) {
      return NextResponse.json({
        success: false,
        error: simulation.value.err,
        logs: simulation.value.logs,
      });
    }
    
    return NextResponse.json({
      success: true,
      unitsConsumed: simulation.value.unitsConsumed,
      logs: simulation.value.logs,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

