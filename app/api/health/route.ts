import { NextResponse } from 'next/server';
import { checkSupabaseHealth } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const health = await checkSupabaseHealth();
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: health
  });
}
