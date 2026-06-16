import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', ts: Date.now() });
}

export const dynamic = 'force-dynamic';
