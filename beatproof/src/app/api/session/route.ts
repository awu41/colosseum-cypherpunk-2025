import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'beatproof-session';
const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (typeof address !== 'string' || !address) {
      return NextResponse.json({ error: 'Address is required.' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: address,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: WEEK_IN_SECONDS,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    maxAge: 0,
    path: '/',
  });

  return response;
}
