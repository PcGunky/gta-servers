import { NextRequest, NextResponse } from 'next/server';
import { getAllServers, supabase, recordPlayerSnapshot } from '@/lib/data';
import { fetchFiveMStatus } from '@/lib/fivem';

export const dynamic = 'force-dynamic';

/**
 * Executes async tasks with a strict concurrency ceiling to protect against
 * socket exhaustion and external rate limits (e.g. Cfx.re / Cloudflare).
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

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
    const concurrency = Math.min(
      30,
      searchParams.get('concurrency') ? parseInt(searchParams.get('concurrency')!, 10) : 20
    );

    const allServers = await getAllServers();
    let fivemServers = allServers.filter(
      s => s.platform === 'FiveM' || s.cfx_code || s.port === 30120
    );

    if (offset > 0 || (limit !== undefined && limit > 0)) {
      fivemServers = fivemServers.slice(offset, limit !== undefined ? offset + limit : undefined);
    }

    const serverUpdates: Array<{ id: string; payload: Record<string, any> }> = [];

    // Query server statuses with controlled concurrency (e.g. 20 concurrent requests)
    const results = await runWithConcurrency(fivemServers, concurrency, async (server) => {
      try {
        const status = await fetchFiveMStatus({
          cfxOrInput: server.cfx_code || undefined,
          ip: server.ip,
          port: server.port
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
          payload: updatePayload
        });

        return {
          id: server.id,
          name: server.name,
          online: status.online,
          players: newPlayers,
          maxPlayers: newMax,
          source: status.source
        };
      } catch (e: any) {
        return {
          id: server.id,
          name: server.name,
          error: e.message
        };
      }
    });

    // Write server updates in parallel batches (10 DB writes at a time)
    if (serverUpdates.length > 0) {
      if (supabase) {
        const client = supabase;
        await runWithConcurrency(serverUpdates, 10, async ({ id, payload }) => {
          await client
            .from('servers')
            .update(payload)
            .eq('id', id);

          if (payload.status === 'online' && typeof payload.current_players === 'number') {
            await recordPlayerSnapshot(id, payload.current_players);
          }
        });
      } else {
        for (const update of serverUpdates) {
          if (update.payload.status === 'online') {
            await recordPlayerSnapshot(update.id, update.payload.current_players);
          }
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const onlineCount = results.filter((r: any) => r.online).length;

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      durationMs,
      totalChecked: fivemServers.length,
      onlineCount,
      offlineCount: fivemServers.length - onlineCount,
      results
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to sync FiveM server stats' },
      { status: 500 }
    );
  }
}
