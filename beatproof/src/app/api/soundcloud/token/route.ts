import { NextResponse } from 'next/server';
import { z } from 'zod';

import { exchangeCodeForToken } from '@/lib/soundcloud/client';

const BodySchema = z.object({
  code: z.string().min(1),
  redirectUri: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const token = await exchangeCodeForToken(parsed.data);

    return NextResponse.json(token);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unexpected error' },
      { status: 500 },
    );
  }
}

