import { NextRequest, NextResponse } from 'next/server';
import { submitServer, attachServerDiscordMessage } from '@/lib/data';
import { extractCfxCode, fetchFiveMStatus } from '@/lib/fivem';
import { sendSubmissionDiscordWebhook } from '@/lib/discord-webhook';

// In-memory rate limiter: maximum 5 submissions per 10 minutes per IP
const submissionRateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const timestamps = submissionRateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < windowMs);
  if (validTimestamps.length >= limit) {
    submissionRateLimitMap.set(ip, validTimestamps);
    return false;
  }
  validTimestamps.push(now);
  submissionRateLimitMap.set(ip, validTimestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const submitterIp = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';

    if (!checkRateLimit(submitterIp)) {
      return NextResponse.json(
        { error: 'Submission rate limit reached. Please wait a few minutes before submitting another server.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Parse Cfx.re link or code
    const rawCfx = body.cfx_code || body.cfx_url || body.cfx || (body.ip && String(body.ip).includes('cfx.re') ? body.ip : undefined);
    const cfx_code = extractCfxCode(rawCfx);
    const cfx_url = cfx_code ? `https://cfx.re/join/${cfx_code}` : undefined;

    // Validation
    const name = String(body.name || '').trim();
    let ip = String(body.ip || '').trim();
    let port = Number(body.port) || 30120;
    const server_type = String(body.server_type || 'Roleplay').trim();
    const platform = String(body.platform || 'FiveM').trim();
    const country = String(body.country || 'Germany').trim();
    const language = String(body.language || 'English').trim();
    const description = String(body.description || '').trim();
    const long_description = String(body.long_description || description).trim();
    const website_url = body.website_url ? String(body.website_url).trim() : undefined;
    const discord_url = body.discord_url ? String(body.discord_url).trim() : undefined;

    // Sanitize image URLs to prevent dangerous schemes and invalid payloads
    const sanitizeImageUrl = (url?: any): string | undefined => {
      if (!url || typeof url !== 'string') return undefined;
      const t = url.trim();
      if (!t.startsWith('http://') && !t.startsWith('https://')) return undefined;
      if (t.startsWith('data:') || t.includes('javascript:')) return undefined;
      return t;
    };

    const banner_url = sanitizeImageUrl(body.banner_url);
    let logo_url = sanitizeImageUrl(body.logo_url);
    let max_players = Number(body.max_players) || 1000;
    let current_players = Number(body.current_players) || 0;
    let server_status: 'online' | 'offline' = 'online';

    // If FiveM server with Cfx code or IP, perform initial live ping
    if (platform === 'FiveM' && (cfx_code || ip)) {
      try {
        const liveStatus = await fetchFiveMStatus({
          cfxOrInput: cfx_code || undefined,
          ip: ip && !ip.includes('cfx.re') ? ip : undefined,
          port,
          bypassCache: true
        });

        if (liveStatus.online) {
          server_status = 'online';
          current_players = liveStatus.players;
          if (liveStatus.maxPlayers > 0) max_players = liveStatus.maxPlayers;
          if (!logo_url && liveStatus.logoUrl) {
            logo_url = liveStatus.logoUrl;
          }
          if ((!ip || ip.includes('cfx.re')) && liveStatus.ip) {
            ip = liveStatus.ip;
            if (liveStatus.port) port = liveStatus.port;
          }
        } else if (cfx_code) {
          // If a Cfx code was explicitly provided and server is unreachable
          server_status = 'offline';
          current_players = 0;
        }
      } catch {
        // Fall back to submitted values
      }
    }

    // Default IP fallback if user only gave cfx.re link
    if (!ip || ip.includes('cfx.re')) {
      ip = cfx_code ? `cfx.re/join/${cfx_code}` : '127.0.0.1';
    }

    if (!name || name.length < 3) {
      return NextResponse.json({ error: 'Server name must be at least 3 characters long.' }, { status: 400 });
    }

    if (!ip || ip.length < 3) {
      return NextResponse.json({ error: 'Valid server IP or domain hostname is required.' }, { status: 400 });
    }

    if (port < 1 || port > 65535) {
      return NextResponse.json({ error: 'Server port must be between 1 and 65535.' }, { status: 400 });
    }

    if (!description || description.length < 10) {
      return NextResponse.json({ error: 'Short description must be at least 10 characters long.' }, { status: 400 });
    }

    // Process tags
    let tags: string[] = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t: any) => String(t).trim()).filter(Boolean);
    } else if (typeof body.tags === 'string') {
      tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    if (tags.length === 0) tags = [server_type, 'GTA 5'];

    // Process rules
    let rules: string[] = [];
    if (Array.isArray(body.rules)) {
      rules = body.rules.map((r: any) => String(r).trim()).filter(Boolean);
    } else if (typeof body.rules === 'string') {
      rules = body.rules.split('\n').map((r: string) => r.trim()).filter(Boolean);
    }
    if (rules.length === 0) rules = ['Respect all players and administrators.'];

    // Auto-generate feature cards from selected tags
    const TAG_FEATURES: Record<string, { title: string; description: string }> = {
      'Roleplay':         { title: 'Immersive Roleplay',       description: 'Deep character-driven roleplay with custom scripts and active administrators.' },
      'Serious RP':       { title: 'Serious Roleplay',         description: 'Strict in-character enforcement with Value of Life rules and immersive storytelling.' },
      'Voice Chat':       { title: 'Proximity Voice Chat',     description: 'Integrated SaltyChat / Teamspeak proximity voice for immersive in-person communication.' },
      'Custom Cars':      { title: 'Custom Vehicle Pack',      description: '100+ handpicked custom car models with tuned handling physics and real engine sounds.' },
      'Economy System':   { title: 'Player Economy',           description: 'Balanced player-driven financial ecosystem with jobs, businesses, and banking.' },
      'Whitelist':        { title: 'Whitelist Application',    description: 'Quality-controlled entry via application process ensuring a high roleplay standard.' },
      'Active Admins':    { title: 'Active Administration',    description: '24/7 moderation team handling reports, whitelists, and community events.' },
      'Freeroam':         { title: 'Open World Freeroam',      description: 'No restrictions — spawn any car, explore the map, and play your way.' },
      'PvP':              { title: 'Competitive PvP',          description: 'Custom weapon ballistics, arena combat, and turf war systems for competitive play.' },
      'Racing':           { title: 'Street & Track Racing',    description: 'Circuit tracks, drag strips, and custom vehicle physics with live lap leaderboards.' },
      'Stunts':           { title: 'Stunt Tracks & Ramps',     description: 'Mega ramps, sky-high parkour, loop-de-loops, and community-built stunt courses.' },
      'Mini Games':       { title: 'Mini Game Modes',          description: 'Rotating game modes including survival, deathmatch arenas, and skill challenges.' },
      'Custom Scripts':   { title: 'Custom Framework',         description: 'Proprietary scripts delivering high server FPS, smooth sync, and unique gameplay.' },
      'Gangs':            { title: 'Gang Territories',         description: 'Claim turf, manufacture drugs, and control criminal operations across the city.' },
      'No Pay2Win':       { title: 'No Pay-to-Win',            description: 'All gameplay content is earned in-game — no paid advantages or P2W mechanics.' },
    };

    const features = tags
      .filter(t => TAG_FEATURES[t])
      .map(t => TAG_FEATURES[t]);

    // Always ensure at least one feature entry
    if (features.length === 0) {
      features.push({ title: 'Active Community', description: 'Friendly players and a dedicated staff team.' });
    }

    const result = await submitServer({
      name,
      ip,
      port,
      game: String(body.game || 'GTA 5').trim(),
      game_version: String(body.game_version || 'v1.0.3095').trim(),
      platform: String(body.platform || 'FiveM').trim(),
      server_type,
      game_mode: String(body.game_mode || server_type).trim(),
      region: String(body.region || 'Europe').trim(),
      country,
      language,
      tags,
      website_url,
      discord_url,
      banner_url,
      logo_url,
      cfx_code,
      cfx_url,
      status: server_status,
      max_players,
      current_players,
      description,
      long_description,
      rules,
      features
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to submit server' }, { status: 409 });
    }

    // Dispatch real-time alert to staff verification channel on Discord
    sendSubmissionDiscordWebhook({
      name,
      slug: result.slug || '',
      ip,
      port,
      platform,
      server_type,
      country,
      language,
      cfx_code,
      banner_url,
      logo_url,
      discord_url,
      website_url,
      current_players,
      max_players,
      submitter_ip: submitterIp,
      description,
      long_description,
      rules,
      tags
    }).then(async (whRes) => {
      if (whRes && whRes.messageId && result.slug) {
        await attachServerDiscordMessage(result.slug, whRes.messageId);
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      slug: result.slug,
      message: 'Server successfully registered and queued for staff review!'
    }, { status: 201 });

  } catch (err: any) {
    console.error('API /api/servers/submit error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
