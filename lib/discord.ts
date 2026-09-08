// Discord Public Invite Query Service
// Fetches real-time server member counts and presence using Discord's open invites API

export interface DiscordStatsResult {
  valid: boolean;
  code?: string;
  guildName?: string;
  memberCount?: number;
  onlineCount?: number;
  iconUrl?: string;
  inviteUrl?: string;
}

const discordCache = new Map<string, { data: DiscordStatsResult; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60s cache

export function extractDiscordInviteCode(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim();

  // Match discord.gg/CODE or discord.com/invite/CODE
  const match = clean.match(/(?:discord(?:\.gg|\.com\/invite)\/)([a-zA-Z0-9_-]+)/i);
  if (match && match[1]) {
    return match[1];
  }

  // Standalone code (alphanumeric with hyphens/underscores, min 2 chars)
  if (/^[a-zA-Z0-9_-]{2,32}$/.test(clean)) {
    return clean;
  }

  return null;
}

export async function fetchDiscordStats(inviteUrl?: string | null): Promise<DiscordStatsResult> {
  const code = extractDiscordInviteCode(inviteUrl);
  if (!code) {
    return { valid: false };
  }

  const cacheKey = code.toLowerCase();
  const now = Date.now();
  const cached = discordCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://discord.com/api/v9/invites/${encodeURIComponent(code)}?with_counts=true`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      const data = await res.json();
      const result: DiscordStatsResult = {
        valid: true,
        code,
        guildName: data.guild?.name || undefined,
        memberCount: typeof data.approximate_member_count === 'number' ? data.approximate_member_count : undefined,
        onlineCount: typeof data.approximate_presence_count === 'number' ? data.approximate_presence_count : undefined,
        iconUrl: data.guild?.icon ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png` : undefined,
        inviteUrl: `https://discord.gg/${code}`
      };

      discordCache.set(cacheKey, { data: result, expiresAt: now + CACHE_TTL_MS });
      return result;
    }
  } catch {
    // Return fallback on timeout or error
  }

  const fallback: DiscordStatsResult = {
    valid: false,
    code,
    inviteUrl: `https://discord.gg/${code}`
  };
  return fallback;
}
