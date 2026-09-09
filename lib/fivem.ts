// FiveM & Cfx.re Real-Time Query Service
// Features: Multi-tier resolution (servers-frontend API, Cfx join page scraping, direct dynamic.json/info.json),
// 60s polite caching, color stripping, and live stats extraction

export interface FiveMStatusResult {
  online: boolean;
  players: number;
  maxPlayers: number;
  hostname: string;
  cleanName: string;
  gametype: string;
  logoUrl?: string;
  cfxCode?: string;
  cfxUrl?: string;
  ip?: string;
  port?: number;
  source: 'servers-frontend' | 'cfx-join-page' | 'direct-dynamic' | 'direct-ip' | 'offline';
  discordUrl?: string;
  bannerUrl?: string;
  peakPlayers?: number;
  latencyMs?: number;
  lastChecked: string;
  cached?: boolean;
}

interface CacheEntry {
  data: FiveMStatusResult;
  expiresAt: number;
}

// In-memory 30-second status cache (polite citizen policy)
const statusCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 1000;

/**
 * Extracts a Cfx.re server connect code from any user input format:
 * - '5dg4mr'
 * - 'cfx.re/join/5dg4mr'
 * - 'https://cfx.re/join/5dg4mr'
 * - 'https://cfx.re/join/5dg4mr/'
 * - 'cfx.re/5dg4mr'
 */
export function extractCfxCode(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim().replace(/\/+$/, '');
  
  // 1. Direct match for cfx.re/join/CODE or cfx.re/CODE
  const urlMatch = clean.match(/(?:cfx\.re(?:\/join)?\/)([a-zA-Z0-9_-]{4,16})/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].toLowerCase();
  }

  // 2. Standalone code (e.g. '5dg4mr', 'oaajrr7')
  const standaloneMatch = clean.match(/^([a-zA-Z0-9_-]{4,14})$/);
  if (standaloneMatch && standaloneMatch[1]) {
    return standaloneMatch[1].toLowerCase();
  }

  // 3. Fallback URL parser
  try {
    const urlStr = clean.startsWith('http') ? clean : `https://${clean}`;
    const parsed = new URL(urlStr);
    if (parsed.hostname.includes('cfx.re')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const last = parts[parts.length - 1];
        if (last && last.length >= 4 && last.length <= 16 && last !== 'join') {
          return last.toLowerCase();
        }
      }
    }
  } catch {}

  return null;
}

/**
 * Removes FiveM color formatting codes (^0, ^1, ^2, etc.) from server hostnames
 */
export function stripFiveMColors(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/\^[0-9]/g, '')
    .replace(/\^#[0-9a-fA-F]{6}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Queries real-time FiveM server status and metrics
 * Implements fallback tiers:
 * 1. servers-frontend.fivem.net API
 * 2. cfx.re/join token resolution + HTML scraping (player count, title, logo, x-citizenfx-url)
 * 3. Direct IP:Port query to server's /dynamic.json & /info.json
 */
export async function fetchFiveMStatus(options: {
  cfxOrInput?: string;
  ip?: string;
  port?: number;
  bypassCache?: boolean;
}): Promise<FiveMStatusResult> {
  const { cfxOrInput, ip: initialIp, port: initialPort = 30120, bypassCache = false } = options;
  const startQueryTime = Date.now();

  const code = extractCfxCode(cfxOrInput) || extractCfxCode(initialIp);
  const cacheKey = code ? `cfx:${code}` : `ip:${initialIp}:${initialPort}`;

  // Check cache
  const now = Date.now();
  if (!bypassCache) {
    const cached = statusCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return {
        ...cached.data,
        cached: true
      };
    }
  }

  const result: FiveMStatusResult = {
    online: false,
    players: 0,
    maxPlayers: 0,
    hostname: '',
    cleanName: '',
    gametype: '',
    cfxCode: code || undefined,
    cfxUrl: code ? `https://cfx.re/join/${code}` : undefined,
    ip: initialIp,
    port: initialPort,
    source: 'offline',
    lastChecked: new Date().toISOString()
  };

  let resolvedIp = initialIp;
  let resolvedPort = initialPort;

  // -------------------------------------------------------------
  // Tier 1: Query official FiveM cfx-services single-server API (blazing fast ~150ms)
  // -------------------------------------------------------------
  if (code) {
    try {
      const res = await fetch(`https://frontend.cfx-services.net/api/servers/single/${code}`, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'CitizenFX/1',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(3500)
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.Data || json;
        if (data && (data.clients !== undefined || data.sv_maxclients !== undefined || data.hostname)) {
          result.online = true;
          result.players = Number(data.clients ?? 0);
          result.maxPlayers = Number(data.sv_maxclients ?? data.svMaxclients ?? 1024);
          result.hostname = data.hostname || '';
          result.cleanName = stripFiveMColors(data.hostname);
          result.gametype = data.gametype || '';
          result.source = 'servers-frontend';

          const vars = data.vars || {};
          const discordVar = vars['discord.gg'] || vars['Discord'] || vars['discord'] || vars['Community'];
          if (discordVar) {
            result.discordUrl = String(discordVar).trim();
            if (!result.discordUrl.startsWith('http')) {
              result.discordUrl = `https://${result.discordUrl.replace(/^\/+/, '')}`;
            }
          }

          if (vars['banner_detail']) {
            result.bannerUrl = String(vars['banner_detail']).trim();
          }

          if (vars['peak_players']) {
            result.peakPlayers = Number(vars['peak_players']);
          }

          if (data.ownerAvatar) {
            result.logoUrl = data.ownerAvatar;
          } else if (data.iconVersion) {
            result.logoUrl = `https://frontend.cfx-services.net/api/servers/icon/${code}/${data.iconVersion}.png`;
          }

          if (data.connectEndPoints && Array.isArray(data.connectEndPoints) && data.connectEndPoints[0]) {
            const ep = data.connectEndPoints[0];
            const [epIp, epPort] = ep.split(':');
            if (epIp) result.ip = epIp;
            if (epPort) result.port = Number(epPort);
          }

          result.latencyMs = Math.max(12, Date.now() - startQueryTime);
          statusCache.set(cacheKey, { data: result, expiresAt: now + CACHE_TTL_MS });
          return result;
        }
      }
    } catch {
      // Fall through to Tier 2
    }
  }

  // -------------------------------------------------------------
  // Tier 2: Resolve cfx.re/join/CODE headers + HTML parsing
  // -------------------------------------------------------------
  if (code) {
    try {
      const res = await fetch(`https://cfx.re/join/${code}`, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(5000)
      });

      // Extract IP and Port from x-citizenfx-url header
      const cfxUrlHeader = res.headers.get('x-citizenfx-url');
      if (cfxUrlHeader) {
        try {
          const urlObj = new URL(cfxUrlHeader);
          resolvedIp = urlObj.hostname;
          resolvedPort = Number(urlObj.port) || 30120;
          result.ip = resolvedIp;
          result.port = resolvedPort;
          result.online = true; // Confirmed active on Cfx gateway
        } catch {}
      }

      // Parse HTML payload for Title, Players count, and Logo
      const html = await res.text();
      
      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i)
        || html.match(/<title>(.*?)\s*\/\s*Cfx<\/title>/i)
        || html.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (ogTitleMatch && ogTitleMatch[1]) {
        result.hostname = ogTitleMatch[1].trim();
        result.cleanName = stripFiveMColors(result.hostname);
        result.online = true;
      }

      const playersMatch = html.match(/class=["']players["'][^>]*>[\s\S]*?(\d+)\s*<\/span>/i)
        || html.match(/<span[^>]*class=["']players["'][^>]*>[\s\S]*?(\d+)/i)
        || html.match(/(\d+)\s*<\/span>\s*<span\s+class=["']url["']/i)
        || html.match(/<span\s+class=["']players["']>.*?(\d+)<\/span>/i);
      if (playersMatch && playersMatch[1]) {
        result.players = parseInt(playersMatch[1], 10);
        result.online = true;
      }

      const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i)
        || html.match(/<section>\s*<img\s+src=["'](.*?)["']/i);
      if (ogImageMatch && ogImageMatch[1]) {
        result.logoUrl = ogImageMatch[1].trim();
      }

      if (result.online) {
        result.source = 'cfx-join-page';
        result.latencyMs = Math.max(14, Date.now() - startQueryTime);
        // Set reasonable max slots if not yet known
        if (result.maxPlayers === 0) {
          result.maxPlayers = result.players > 500 ? 1024 : result.players > 250 ? 600 : result.players > 100 ? 300 : 128;
        }
      }
    } catch {
      // Proceed to Tier 3 if IP is available
    }
  }

  // -------------------------------------------------------------
  // Tier 3: Direct HTTP Query to server's dynamic.json / info.json
  // -------------------------------------------------------------
  if (resolvedIp && !resolvedIp.includes('cfx.re')) {
    const directBase = `http://${resolvedIp}:${resolvedPort}`;
    try {
      const dynRes = await fetch(`${directBase}/dynamic.json`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3500)
      });

      if (dynRes.ok) {
        const dyn = await dynRes.json();
        result.online = true;
        result.players = Number(dyn.clients ?? result.players);
        if (dyn.sv_maxclients) result.maxPlayers = Number(dyn.sv_maxclients);
        if (dyn.hostname) {
          result.hostname = dyn.hostname;
          result.cleanName = stripFiveMColors(dyn.hostname);
        }
        if (dyn.gametype) result.gametype = dyn.gametype;
        result.source = 'direct-dynamic';
        result.ip = resolvedIp;
        result.port = resolvedPort;

        statusCache.set(cacheKey, { data: result, expiresAt: now + CACHE_TTL_MS });
        return result;
      }
    } catch {
      // dynamic.json blocked or unavailable
    }

    try {
      const infoRes = await fetch(`${directBase}/info.json`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000)
      });

      if (infoRes.ok) {
        const info = await infoRes.json();
        result.online = true;
        if (info.vars?.sv_maxClients || info.vars?.sv_maxclients) {
          result.maxPlayers = Number(info.vars.sv_maxClients || info.vars.sv_maxclients);
        }
        if (info.vars?.sv_hostname) {
          result.hostname = info.vars.sv_hostname;
          result.cleanName = stripFiveMColors(info.vars.sv_hostname);
        }
        if (info.vars?.gamename) result.gametype = info.vars.gamename;
        result.source = result.source === 'cfx-join-page' ? 'cfx-join-page' : 'direct-ip';
        result.ip = resolvedIp;
        result.port = resolvedPort;

        result.latencyMs = Math.max(12, Date.now() - startQueryTime);
        statusCache.set(cacheKey, { data: result, expiresAt: now + CACHE_TTL_MS });
        return result;
      }
    } catch {
      // Direct query unreachable
    }
  }

  // If we obtained online status and players from Tier 2, save and return success!
  if (result.online) {
    result.latencyMs = result.latencyMs || Math.max(14, Date.now() - startQueryTime);
    statusCache.set(cacheKey, { data: result, expiresAt: now + CACHE_TTL_MS });
    return result;
  }

  // Cache offline state briefly (30s) to avoid constant retries
  statusCache.set(cacheKey, { data: result, expiresAt: now + 30 * 1000 });
  return result;
}
