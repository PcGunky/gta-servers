import { NextRequest, NextResponse } from 'next/server';
import { castVote } from '@/lib/data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serverId } = body;

    if (!serverId) {
      return NextResponse.json(
        { success: false, message: 'Server ID is required' },
        { status: 400 }
      );
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const result = await castVote(serverId, clientIp);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error processing vote' },
      { status: 500 }
    );
  }
}
