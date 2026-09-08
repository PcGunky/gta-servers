import { NextRequest, NextResponse } from 'next/server';
import { fetchFiveMStatus } from '@/lib/fivem';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cfx = searchParams.get('cfx') || searchParams.get('code') || searchParams.get('url');
    const ip = searchParams.get('ip');
    const port = Number(searchParams.get('port')) || 30120;
    const bypassCache = searchParams.get('nocache') === 'true';

    if (!cfx && !ip) {
      return NextResponse.json(
        { error: 'Missing required query parameter: "cfx" or "ip" must be provided.' },
        { status: 400 }
      );
    }

    const status = await fetchFiveMStatus({
      cfxOrInput: cfx || undefined,
      ip: ip || undefined,
      port,
      bypassCache
    });

    return NextResponse.json(status, {
      headers: {
        'Cache-Control': status.cached ? 'public, max-age=60' : 'no-cache'
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to query FiveM server status' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cfx = body.cfx || body.cfx_code || body.code || body.url;
    const ip = body.ip;
    const port = Number(body.port) || 30120;
    const bypassCache = Boolean(body.bypassCache);

    if (!cfx && !ip) {
      return NextResponse.json(
        { error: 'Missing required body field: "cfx" or "ip" must be provided.' },
        { status: 400 }
      );
    }

    const status = await fetchFiveMStatus({
      cfxOrInput: cfx || undefined,
      ip: ip || undefined,
      port,
      bypassCache
    });

    return NextResponse.json(status);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to query FiveM server status' },
      { status: 500 }
    );
  }
}
