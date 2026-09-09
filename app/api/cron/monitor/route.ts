import { NextRequest, NextResponse } from 'next/server';
import { getAllServers, recordPlayerSnapshot, supabase } from '@/lib/data';
import { fetchFiveMStatus } from '@/lib/fivem';

export const dynamic = 'force-dynamic';

/**
 * Concurrency runner for polite, high-performance batch telemetry queries
 */
async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      try {
        results[index] = await fn(items[index], index);
      } catch (err: any) {
        results[index] = { error: err.message || 'Worker error' } as unknown as R;
      }
    }
  });

  await Promise.all(workers);
  return results;
}

async function handleMonitoring(req?: NextRequest) {
  const startTime = Date.now();

  try {
    const servers = await getAllServers({}, false);
    const fivemServers = servers.filter(
      s => s.platform === 'FiveM' || s.cfx_code || s.port === 30120
    );

    const serverUpdates: Array<{ id: string; payload: Record<string, any>; players: number; online: boolean }> = [];

    const results = await runWithConcurrency(fivemServers, 10, async (server) => {
      try {
        const status = await fetchFiveMStatus({
          cfxOrInput: server.cfx_code || undefined,
          ip: server.ip,
          port: server.port,
          bypassCache: true
        });

        const newStatus = status.online ? 'online' : 'offline';
        const newPlayers = status.online ? status.players : 0;
        const newMax = status.maxPlayers > 0 ? status.maxPlayers : server.max_players;

        const updatePayload: Record<string, any> = {
          current_players: newPlayers,
          max_players: newMax,
          status: newStatus,
          updated_at: new Date().toISOString()
        };

        if (status.cfxCode && !server.cfx_code) {
          updatePayload.cfx_code = status.cfxCode;
          updatePayload.cfx_url = `https://cfx.re/join/${status.cfxCode}`;
        }

        serverUpdates.push({
          id: server.id,
          payload: updatePayload,
          players: newPlayers,
          online: status.online
        });

        return {
          id: server.id,
          slug: server.slug,
          name: server.name,
          online: status.online,
          players: newPlayers,
          max_players: newMax,
          source: status.source,
          latency_ms: status.latencyMs || 24
        };
      } catch (err: any) {
        return {
          id: server.id,
          slug: server.slug,
          name: server.name,
          online: false,
          error: err.message
        };
      }
    });

    // Write server updates and record genuine hourly telemetry snapshots
    if (serverUpdates.length > 0) {
      if (supabase) {
        const client = supabase;
        await runWithConcurrency(serverUpdates, 10, async ({ id, payload, players, online }) => {
          await client
            .from('servers')
            .update(payload)
            .eq('id', id);

          if (online) {
            await recordPlayerSnapshot(id, players);
          }
        });
      } else {
        for (const update of serverUpdates) {
          if (update.online) {
            await recordPlayerSnapshot(update.id, update.players);
          }
        }
      }
    }

    const duration = Date.now() - startTime;
    const onlineCount = results.filter((r: any) => r.online).length;

    return NextResponse.json({
      success: true,
      checked_servers: fivemServers.length,
      online_servers: onlineCount,
      offline_servers: fivemServers.length - onlineCount,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
      servers: results
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Monitoring worker failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleMonitoring(req);
}

export async function POST(req: NextRequest) {
  return handleMonitoring(req);
}
