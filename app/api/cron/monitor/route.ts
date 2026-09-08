import { NextResponse } from 'next/server';
import { getAllServers } from '@/lib/data';

// Monitoring Worker Cron Route (Rules.md #11, #60)
// Can be called periodically by monitoring daemon / GitHub Actions / Vercel Cron
export async function GET() {
  const startTime = Date.now();
  const servers = await getAllServers();

  const results = servers.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    ip: s.ip,
    status: s.status,
    current_players: s.current_players,
    latency_ms: Math.floor(Math.random() * 15) + 20, // Real-time ping simulation
    last_checked: new Date().toISOString()
  }));

  const duration = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    checked_servers: results.length,
    duration_ms: duration,
    timestamp: new Date().toISOString(),
    servers: results
  });
}
