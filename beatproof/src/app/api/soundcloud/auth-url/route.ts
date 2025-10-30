import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildAuthorizeUrl } from '@/lib/soundcloud/client';

const AuthQuery = z.object({
  state: z.string().optional(),
  scope: z.string().optional(),
  redirectUriOverride: z.string().url().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = AuthQuery.safeParse({
      state: searchParams.get('state') ?? undefined,
      scope: searchParams.get('scope') ?? undefined,
      redirectUriOverride: searchParams.get('redirectUri') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { state, scope, redirectUriOverride } = parsed.data;
    const authUrl = buildAuthorizeUrl({
      state,
      redirectUriOverride,
      scope: scope ? scope.split(' ') : undefined,
    });

    return NextResponse.json({ authUrl });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unexpected error' },
      { status: 500 },
    );
  }
}

