// Universal Data Access Layer for GTA Game Servers
// Implements Supabase PostgreSQL queries with seamless fallback to rich typed seed data

import { createClient } from '@supabase/supabase-js';
import { ServerEntity, FilterParams } from './types';
import { INITIAL_SERVERS } from './seed';
import { extractCfxCode, fetchFiveMStatus } from './fivem';

// Ensure WebSocket compatibility for Node.js environments
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class DummyWebSocket {} as any;
}

// Clean project URL (strip any trailing /rest/v1 or trailing slashes)
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

// Local in-memory store for dev / fallback mode
let memoryServers = [...INITIAL_SERVERS];
const memoryVotes = new Map<string, number>(); // ip:serverId -> timestamp
export const memoryPlayerHistory = new Map<string, Array<{ count: number; recorded_at: string; time: string }>>();

export function formatHistoryTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  } catch {
    return '00:00';
  }
}

/**
 * Normalizes raw Supabase records:
 * Extracts cfx_code from column, or from tags ('cfx:CODE'), or from cfx.re IP address,
 * ensuring complete compatibility even before SQL migration columns are added.
 */
export function normalizeServerEntity(raw: any, rank?: number): ServerEntity {
  const rawTags = Array.isArray(raw.tags) ? raw.tags : [];
  const isPending = rawTags.some((t: string) => typeof t === 'string' && t.toLowerCase() === 'pending_approval');
  const isApproved = raw.is_approved !== undefined ? Boolean(raw.is_approved) : !isPending;

  const cfxTag = rawTags.find((t: string) => typeof t === 'string' && t.startsWith('cfx:'));
  const cfxFromTag = cfxTag ? cfxTag.replace('cfx:', '').trim() : null;
  const cfxFromIp = raw.ip && String(raw.ip).includes('cfx.re') ? extractCfxCode(raw.ip) : null;
  const cfx_code = raw.cfx_code || cfxFromTag || cfxFromIp || null;
  const cfx_url = raw.cfx_url || (cfx_code ? `https://cfx.re/join/${cfx_code}` : null);

  // Strip internal cfx:, discord_msg:, and pending_approval tags so users never see them in the tag pills
  const cleanTags = rawTags.filter((t: string) => 
    typeof t === 'string' && 
    !t.startsWith('cfx:') && 
    !t.startsWith('discord_msg:') &&
    t.toLowerCase() !== 'pending_approval' &&
    t.toLowerCase() !== 'approved'
  );

  return {
    ...raw,
    cfx_code,
    cfx_url,
    tags: cleanTags,
    is_approved: isApproved,
    rank: rank !== undefined ? rank : (raw.rank || 1)
  };
}

export async function getAllServers(filter?: FilterParams, includePending = false): Promise<ServerEntity[]> {
  if (supabase) {
    try {
      let query = supabase.from('servers').select('*');

      if (filter?.category && filter.category !== 'all') {
        query = query.ilike('server_type', `%${filter.category}%`);
      }
      if (filter?.country) {
        query = query.ilike('country', `%${filter.country}%`);
      }
      if (filter?.language) {
        query = query.ilike('language', `%${filter.language}%`);
      }
      if (filter?.search) {
        query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
      }

      if (filter?.sort === 'players') {
        query = query.order('current_players', { ascending: false });
      } else if (filter?.sort === 'votes') {
        query = query.order('vote_count', { ascending: false });
      } else if (filter?.sort === 'uptime') {
        query = query.order('uptime_percentage', { ascending: false });
      } else {
        query = query.order('vote_count', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        const normalized = data.map((item, idx) => normalizeServerEntity(item, idx + 1));
        return includePending ? normalized : normalized.filter(s => s.is_approved !== false);
      }
      if (error) {
        console.error('Supabase query error in getAllServers:', error);
      }
    } catch (err: any) {
      console.error('Supabase exception in getAllServers:', err.message);
    }
  }

  // Only use local mock store if Supabase is NOT configured at all
  if (!supabase) {
    let list = memoryServers
      .map((s, idx) => normalizeServerEntity(s, idx + 1))
      .filter(s => includePending || s.is_approved !== false);

    if (filter?.category && filter.category !== 'all') {
      const catLower = filter.category.toLowerCase();
      list = list.filter(s => 
        s.server_type.toLowerCase().includes(catLower) ||
        s.game_mode.toLowerCase().includes(catLower) ||
        s.tags.some(t => t.toLowerCase().includes(catLower)) ||
        (catLower === 'germany' && s.country.toLowerCase() === 'germany') ||
        (catLower === 'english' && s.language.toLowerCase() === 'english') ||
        (catLower === 'pvp' && (s.server_type.toLowerCase().includes('pvp') || s.game_mode.toLowerCase().includes('pvp') || s.game_mode.toLowerCase().includes('deathmatch'))) ||
        (catLower === 'stunt' && (s.game_mode.toLowerCase().includes('stunt') || s.tags.some(t => t.toLowerCase().includes('stunt')))) ||
        (catLower === 'racing' && (s.server_type.toLowerCase().includes('racing') || s.game_mode.toLowerCase().includes('race'))) ||
        (catLower === 'other' && (s.tags.includes('Mini Games') || s.game_mode.includes('Semi-Serious') || s.tags.includes('Freeroam')))
      );
    }

    if (filter?.country) {
      const cLower = filter.country.toLowerCase();
      list = list.filter(s => s.country.toLowerCase() === cLower || s.region.toLowerCase() === cLower);
    }

    if (filter?.language) {
      const lLower = filter.language.toLowerCase();
      list = list.filter(s => s.language.toLowerCase() === lLower);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filter?.sort === 'players') {
      list.sort((a, b) => b.current_players - a.current_players);
    } else if (filter?.sort === 'votes') {
      list.sort((a, b) => b.vote_count - a.vote_count);
    } else if (filter?.sort === 'uptime') {
      list.sort((a, b) => b.uptime_percentage - a.uptime_percentage);
    } else {
      list.sort((a, b) => b.vote_count - a.vote_count);
    }

    return list.map((s, idx) => ({
      ...s,
      rank: idx + 1
    }));
  }

  return [];
}

export async function getServerBySlug(slug: string, allowPending = false): Promise<ServerEntity | null> {
  const cleanSlug = slug.toLowerCase().trim();
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .ilike('slug', cleanSlug)
        .maybeSingle();
      
      if (!error && data) {
        const entity = normalizeServerEntity(data);
        if (!allowPending && entity.is_approved === false) {
          return null;
        }

        // Query genuine 24h player history from database
        try {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { data: historyRows } = await supabase
            .from('player_history')
            .select('player_count, recorded_at')
            .eq('server_id', data.id)
            .gte('recorded_at', oneDayAgo)
            .order('recorded_at', { ascending: true });

          if (historyRows && historyRows.length > 0) {
            entity.player_history = historyRows.map((r: any) => ({
              time: formatHistoryTime(r.recorded_at),
              count: Number(r.player_count),
              recorded_at: r.recorded_at
            }));
          } else {
            entity.player_history = [];
          }
        } catch {
          entity.player_history = [];
        }
        return entity;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Fallback to local memory only if Supabase is completely disabled
  const found = memoryServers.find(s => 
    s.slug.toLowerCase() === cleanSlug ||
    s.slug.toLowerCase().replace('-island', '') === cleanSlug ||
    cleanSlug.replace('-island', '') === s.slug.toLowerCase()
  );
  if (!found) return null;

  const entity = normalizeServerEntity(found);
  if (!allowPending && entity.is_approved === false) {
    return null;
  }

  const memHistory = memoryPlayerHistory.get(found.id) || memoryPlayerHistory.get(found.slug);
  if (memHistory && memHistory.length > 0) {
    return {
      ...entity,
      player_history: memHistory
    };
  }

  return entity;
}

export async function recordPlayerSnapshot(serverId: string, count: number): Promise<void> {
  if (typeof count !== 'number' || isNaN(count) || count < 0) return;
  const now = new Date();
  const nowIso = now.toISOString();
  const timeStr = formatHistoryTime(nowIso);

  // In-memory store (also used for immediate local updates)
  const existingMem = memoryPlayerHistory.get(serverId) || [];
  if (existingMem.length > 0) {
    const last = existingMem[existingMem.length - 1];
    const lastTime = last.recorded_at ? new Date(last.recorded_at).getTime() : 0;
    // Throttle: 1 snapshot every 1 hour (60 minutes)
    if (Date.now() - lastTime < 60 * 60 * 1000) {
      last.count = count;
      last.recorded_at = nowIso;
      last.time = timeStr;
      return;
    }
  }

  const newPoint = { count, recorded_at: nowIso, time: timeStr };
  existingMem.push(newPoint);
  if (existingMem.length > 24) existingMem.shift();
  memoryPlayerHistory.set(serverId, existingMem);

  if (supabase) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recent } = await supabase
        .from('player_history')
        .select('id')
        .eq('server_id', serverId)
        .gte('recorded_at', oneHourAgo)
        .limit(1);

      if (!recent || recent.length === 0) {
        await supabase.from('player_history').insert({
          server_id: serverId,
          player_count: count,
          recorded_at: nowIso
        });
      }
    } catch (err: any) {
      console.warn('Could not persist player snapshot to Supabase:', err.message);
    }
  }
}

export async function getSimilarServers(server: ServerEntity, limit = 3): Promise<ServerEntity[]> {
  const all = await getAllServers();
  return all
    .filter(s => s.id !== server.id && (s.server_type === server.server_type || s.country === server.country))
    .slice(0, limit);
}

export async function castVote(serverId: string, ip: string): Promise<{ success: boolean; newCount?: number; message: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('cast_server_vote', {
        p_server_id: serverId,
        p_ip_hash: ip
      });

      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback
    }
  }

  const key = `${ip}:${serverId}`;
  const last = memoryVotes.get(key);
  const now = Date.now();

  if (last && now - last < 24 * 60 * 60 * 1000) {
    return {
      success: false,
      message: 'You have already voted for this server in the last 24 hours.'
    };
  }

  memoryVotes.set(key, now);
  const server = memoryServers.find(s => s.id === serverId || s.slug === serverId);
  if (server) {
    server.vote_count += 1;
    return {
      success: true,
      newCount: server.vote_count,
      message: 'Vote registered successfully!'
    };
  }

  return { success: false, message: 'Server not found' };
}

export async function getOverallStats() {
  const all = await getAllServers();
  const totalServers = all.length;
  const onlinePlayers = all.reduce((acc, s) => acc + s.current_players, 0);
  const fivemPeak = Math.max(...all.map(s => s.current_players), 1024);

  return {
    totalServers,
    onlinePlayers,
    fivemPeak
  };
}

export async function getCategoryCounts(servers?: ServerEntity[]) {
  const all = servers || await getAllServers();
  const total = all.length;
  const roleplay = all.filter(s => s.server_type.toLowerCase().includes('roleplay') || s.game_mode.toLowerCase().includes('rp')).length;
  const freeroam = all.filter(s => s.server_type.toLowerCase().includes('freeroam') || s.game_mode.toLowerCase().includes('freeroam')).length;
  const dm = all.filter(s => s.server_type.toLowerCase().includes('pvp') || s.game_mode.toLowerCase().includes('pvp') || s.game_mode.toLowerCase().includes('dm')).length;
  const racing = all.filter(s => s.server_type.toLowerCase().includes('racing') || s.game_mode.toLowerCase().includes('race')).length;
  const stuntracing = all.filter(s => s.game_mode.toLowerCase().includes('stunt') || s.tags.some(t => t.toLowerCase().includes('stunt'))).length;
  const other = all.filter(s => s.tags.includes('Mini Games') || s.game_mode.includes('Semi-Serious') || s.server_type.toLowerCase().includes('other')).length;

  return {
    all: total,
    freeroam,
    roleplay,
    dm,
    racing,
    stuntracing,
    other
  };
}

export async function submitServer(data: Partial<ServerEntity>): Promise<{ success: boolean; slug?: string; error?: string }> {
  // Generate base slug from server name
  const rawName = (data.name || 'gta-server').toLowerCase().trim();
  let baseSlug = rawName
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  if (!baseSlug) baseSlug = 'gta-server';

  // Check duplicate slug or IP:Port or cfx_code across all servers (including pending)
  const existing = await getAllServers(undefined, true);
  const duplicateIp = existing.find(s => {
    if (data.cfx_code && s.cfx_code && s.cfx_code.toLowerCase() === data.cfx_code.toLowerCase()) {
      return true;
    }
    if (data.ip && !data.ip.includes('cfx.re') && s.ip.toLowerCase() === data.ip?.toLowerCase() && Number(s.port) === Number(data.port)) {
      return true;
    }
    return false;
  });

  if (duplicateIp) {
    return {
      success: false,
      error: `This server is already registered in the directory as "${duplicateIp.name}".`
    };
  }

  let finalSlug = baseSlug;
  let counter = 1;
  while (existing.some(s => s.slug.toLowerCase() === finalSlug.toLowerCase())) {
    finalSlug = `${baseSlug}-${counter++}`;
  }

  // Ensure cfx_code is encoded in tags so it persists even without the cfx_code column in Supabase
  const tagsToSave: string[] = Array.isArray(data.tags) ? [...data.tags] : ['GTA 5'];
  if (data.cfx_code && !tagsToSave.some(t => typeof t === 'string' && t.startsWith('cfx:'))) {
    tagsToSave.push(`cfx:${data.cfx_code.toLowerCase()}`);
  }

  // Pre-moderation: tag new submission as pending_approval until approved via Discord staff action
  if (!tagsToSave.some(t => typeof t === 'string' && t.toLowerCase() === 'pending_approval')) {
    tagsToSave.push('pending_approval');
  }

  const newServer: ServerEntity = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `srv-${Date.now()}`,
    slug: finalSlug,
    name: data.name || 'GTA Server',
    ip: data.ip || 'play.server.com',
    port: Number(data.port) || 30120,
    game: data.game || 'GTA 5',
    game_version: data.game_version || 'v1.0.3095',
    platform: data.platform || 'FiveM',
    server_type: data.server_type || 'Roleplay',
    game_mode: data.game_mode || 'RP',
    region: data.region || 'Europe',
    country: data.country || 'Germany',
    language: data.language || 'English',
    tags: tagsToSave,
    website_url: data.website_url || undefined,
    discord_url: data.discord_url || undefined,
    banner_url: data.banner_url ? data.banner_url.trim() : undefined,
    logo_url: data.logo_url || '/assets/servers/server_1.png',
    cfx_code: data.cfx_code || undefined,
    cfx_url: data.cfx_url || (data.cfx_code ? `https://cfx.re/join/${data.cfx_code}` : undefined),
    current_players: Number(data.current_players) || 0,
    max_players: Number(data.max_players) || 1000,
    status: data.status || 'online',
    vote_count: 1,
    review_count: 0,
    uptime_percentage: 100.0,
    rank: existing.length + 1,
    is_verified: false,
    is_approved: false,
    description: data.description || 'GTA Multiplayer Server',
    long_description: data.long_description || data.description || 'Welcome to our GTA server community.',
    rules: Array.isArray(data.rules) && data.rules.length > 0 ? data.rules : ['Respect all players and staff.'],
    features: Array.isArray(data.features) && data.features.length > 0 ? data.features : [
      { title: 'Active Community', description: 'Friendly players and dedicated staff.' }
    ],
    player_history: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const payload: Record<string, any> = {
        id: newServer.id,
        slug: newServer.slug,
        name: newServer.name,
        ip: newServer.ip,
        port: newServer.port,
        game: newServer.game,
        game_version: newServer.game_version,
        platform: newServer.platform,
        server_type: newServer.server_type,
        game_mode: newServer.game_mode,
        region: newServer.region,
        country: newServer.country,
        language: newServer.language,
        tags: newServer.tags,
        website_url: newServer.website_url,
        discord_url: newServer.discord_url,
        banner_url: newServer.banner_url,
        logo_url: newServer.logo_url,
        cfx_code: newServer.cfx_code,
        cfx_url: newServer.cfx_url,
        current_players: newServer.current_players,
        max_players: newServer.max_players,
        status: newServer.status,
        vote_count: newServer.vote_count,
        review_count: newServer.review_count,
        uptime_percentage: newServer.uptime_percentage,
        rank: newServer.rank,
        description: newServer.description,
        long_description: newServer.long_description,
        rules: newServer.rules,
        features: newServer.features,
        is_verified: newServer.is_verified
      };

      let { data: inserted, error } = await supabase
        .from('servers')
        .insert([payload])
        .select()
        .single();

      // If Supabase schema lacks cfx_code / cfx_url columns (PGRST204), retry cleanly without them
      if (error && (error.code === 'PGRST204' || error.message?.includes('cfx_code') || error.message?.includes('cfx_url'))) {
        console.warn('Supabase servers table lacks cfx_code/cfx_url columns. Retrying insert with cfx encoded in tags...');
        delete payload.cfx_code;
        delete payload.cfx_url;
        const retry = await supabase
          .from('servers')
          .insert([payload])
          .select()
          .single();
        inserted = retry.data;
        error = retry.error;
      }

      if (!error && inserted) {
        memoryServers.unshift(normalizeServerEntity(inserted));
        return { success: true, slug: newServer.slug };
      }

      console.error('Supabase server insert error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to save server in Supabase.'
      };
    } catch (err: any) {
      console.error('Supabase exception on insert:', err.message);
      return {
        success: false,
        error: err?.message || 'Database connection error while saving server.'
      };
    }
  }

  // Local in-memory fallback only if Supabase is completely unconfigured
  memoryServers.unshift(newServer);
  return { success: true, slug: newServer.slug };
}

export async function checkSupabaseHealth() {
  if (!supabase) {
    return {
      connected: false,
      mode: 'fallback (local in-memory)',
      serversCount: memoryServers.length,
      note: 'Provide NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to connect live PostgreSQL.'
    };
  }

  try {
    const { data, error } = await supabase.from('servers').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        mode: 'fallback (database schema pending)',
        error: error.message || 'Table public.servers not found in schema cache',
        note: 'Please run the SQL in supabase/schema.sql in your Supabase project SQL Editor to initialize the database tables and seed data.',
        serversCount: memoryServers.length
      };
    }

    const { count } = await supabase.from('servers').select('*', { count: 'exact', head: true });
    return {
      connected: true,
      mode: 'live Supabase PostgreSQL',
      serversCount: typeof count === 'number' ? count : (data ? data.length : 0)
    };
  } catch (err: any) {
    return {
      connected: false,
      mode: 'fallback (database query failed)',
      error: err?.message || String(err),
      serversCount: memoryServers.length
    };
  }
}

export async function approveServer(slugOrId: string): Promise<{ success: boolean; server?: ServerEntity; discordMessageId?: string; error?: string }> {
  const cleanKey = slugOrId.toLowerCase().trim();

  if (supabase) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanKey);
      let query = supabase.from('servers').select('*');
      if (isUuid) {
        query = query.eq('id', cleanKey);
      } else {
        query = query.ilike('slug', cleanKey);
      }

      const { data: server, error: findError } = await query.maybeSingle();

      if (findError || !server) {
        return { success: false, error: 'Server not found.' };
      }

      const currentTags: string[] = Array.isArray(server.tags) ? server.tags : [];
      const msgTag = currentTags.find((t: string) => typeof t === 'string' && t.startsWith('discord_msg:'));
      const discordMessageId = msgTag ? msgTag.replace('discord_msg:', '').trim() : undefined;

      const updatedTags = currentTags.filter((t: string) => typeof t === 'string' && t.toLowerCase() !== 'pending_approval');

      const { data: updated, error: updateError } = await supabase
        .from('servers')
        .update({
          tags: updatedTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', server.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to approve server in Supabase:', updateError);
        return { success: false, error: updateError.message };
      }

      const entity = normalizeServerEntity(updated || { ...server, tags: updatedTags });
      entity.is_approved = true;

      // Also update memory fallback if loaded
      const memIdx = memoryServers.findIndex(s => s.id === server.id || s.slug.toLowerCase() === server.slug.toLowerCase());
      if (memIdx !== -1) {
        memoryServers[memIdx].tags = memoryServers[memIdx].tags.filter(t => t.toLowerCase() !== 'pending_approval');
        memoryServers[memIdx].is_approved = true;
      }

      return { success: true, server: entity, discordMessageId };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Memory fallback
  const memServer = memoryServers.find(s => s.slug.toLowerCase() === cleanKey || s.id.toLowerCase() === cleanKey);
  if (!memServer) {
    return { success: false, error: 'Server not found.' };
  }
  const msgTag = (memServer.tags || []).find((t: string) => typeof t === 'string' && t.startsWith('discord_msg:'));
  const discordMessageId = msgTag ? msgTag.replace('discord_msg:', '').trim() : undefined;

  memServer.tags = memServer.tags.filter(t => t.toLowerCase() !== 'pending_approval');
  memServer.is_approved = true;
  return { success: true, server: normalizeServerEntity(memServer), discordMessageId };
}

export async function rejectServer(slugOrId: string): Promise<{ success: boolean; server?: ServerEntity; discordMessageId?: string; error?: string }> {
  const cleanKey = slugOrId.toLowerCase().trim();

  if (supabase) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanKey);
      let query = supabase.from('servers').select('*');
      if (isUuid) {
        query = query.eq('id', cleanKey);
      } else {
        query = query.ilike('slug', cleanKey);
      }

      const { data: server, error: findError } = await query.maybeSingle();

      if (findError || !server) {
        return { success: false, error: 'Server not found or already removed.' };
      }

      const msgTag = (server.tags || []).find((t: string) => typeof t === 'string' && t.startsWith('discord_msg:'));
      const discordMessageId = msgTag ? msgTag.replace('discord_msg:', '').trim() : undefined;

      const { error: delError } = await supabase
        .from('servers')
        .delete()
        .eq('id', server.id);

      if (delError) {
        return { success: false, error: delError.message };
      }

      memoryServers = memoryServers.filter(s => s.id !== server.id && s.slug.toLowerCase() !== server.slug.toLowerCase());

      return { success: true, server: normalizeServerEntity(server), discordMessageId };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const idx = memoryServers.findIndex(s => s.slug.toLowerCase() === cleanKey || s.id.toLowerCase() === cleanKey);
  if (idx === -1) {
    return { success: false, error: 'Server not found or already removed.' };
  }
  const deleted = memoryServers.splice(idx, 1)[0];
  const msgTag = (deleted.tags || []).find((t: string) => typeof t === 'string' && t.startsWith('discord_msg:'));
  const discordMessageId = msgTag ? msgTag.replace('discord_msg:', '').trim() : undefined;

  return { success: true, server: normalizeServerEntity(deleted), discordMessageId };
}

export async function attachServerDiscordMessage(slugOrId: string, messageId: string): Promise<boolean> {
  const cleanKey = slugOrId.toLowerCase().trim();
  const tagStr = `discord_msg:${messageId}`;

  if (supabase) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanKey);
      let query = supabase.from('servers').select('id, tags');
      if (isUuid) {
        query = query.eq('id', cleanKey);
      } else {
        query = query.ilike('slug', cleanKey);
      }
      const { data: server } = await query.maybeSingle();
      if (!server) return false;

      const existingTags: string[] = Array.isArray(server.tags) ? server.tags : [];
      if (!existingTags.includes(tagStr)) {
        await supabase
          .from('servers')
          .update({ tags: [...existingTags, tagStr] })
          .eq('id', server.id);
      }
      return true;
    } catch {
      return false;
    }
  }

  const mem = memoryServers.find(s => s.slug.toLowerCase() === cleanKey || s.id.toLowerCase() === cleanKey);
  if (mem && !mem.tags.includes(tagStr)) {
    mem.tags.push(tagStr);
    return true;
  }
  return false;
}

export async function updateServerLiveStatus(slugOrId: string, updates: {
  current_players: number;
  max_players?: number;
  status?: 'online' | 'offline';
  country?: string;
  region?: string;
  language?: string;
  logo_url?: string;
  banner_url?: string;
}): Promise<boolean> {
  const cleanKey = slugOrId.toLowerCase().trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanKey);

  // 1. Update in-memory store
  const memServer = memoryServers.find(s => s.id.toLowerCase() === cleanKey || s.slug.toLowerCase() === cleanKey);
  if (memServer) {
    memServer.current_players = updates.current_players;
    if (updates.max_players && updates.max_players > 0) memServer.max_players = updates.max_players;
    if (updates.status) memServer.status = updates.status;
    if (updates.country) memServer.country = updates.country;
    if (updates.region) memServer.region = updates.region;
    if (updates.language) memServer.language = updates.language;
    if (updates.logo_url && !memServer.logo_url) memServer.logo_url = updates.logo_url;
    if (updates.banner_url && !memServer.banner_url) memServer.banner_url = updates.banner_url;
  }

  // 2. Update Supabase
  if (supabase) {
    try {
      const payload: Record<string, any> = {
        current_players: updates.current_players,
        updated_at: new Date().toISOString()
      };
      if (updates.max_players && updates.max_players > 0) payload.max_players = updates.max_players;
      if (updates.status) payload.status = updates.status;
      if (updates.country) payload.country = updates.country;
      if (updates.region) payload.region = updates.region;
      if (updates.language) payload.language = updates.language;
      if (updates.logo_url) payload.logo_url = updates.logo_url;
      if (updates.banner_url) payload.banner_url = updates.banner_url;

      let query = supabase.from('servers').update(payload);
      if (isUuid) {
        query = query.eq('id', cleanKey);
      } else {
        query = query.ilike('slug', cleanKey);
      }
      await query;
      return true;
    } catch (err: any) {
      console.warn('Failed to update live status in Supabase:', err.message);
      return false;
    }
  }
  return true;
}


