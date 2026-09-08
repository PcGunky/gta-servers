-- ==========================================================================
-- GTA Game Servers Database Schema (Supabase / PostgreSQL)
-- Adheres to Rules.md specifications for Entities, Indexes, RLS, and Programmatic SEO
-- ==========================================================================

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Servers Table
CREATE TABLE IF NOT EXISTS servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    ip TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 30120,
    game TEXT NOT NULL DEFAULT 'GTA 5',
    game_version TEXT DEFAULT 'v1.0.3095',
    platform TEXT DEFAULT 'FiveM',
    server_type TEXT DEFAULT 'Roleplay',
    game_mode TEXT DEFAULT 'RP',
    region TEXT DEFAULT 'Europe',
    country TEXT DEFAULT 'Germany',
    language TEXT DEFAULT 'German',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    website_url TEXT,
    discord_url TEXT,
    banner_url TEXT,
    logo_url TEXT,
    cfx_code TEXT,
    cfx_url TEXT,
    current_players INTEGER DEFAULT 0,
    max_players INTEGER DEFAULT 1000,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
    vote_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    uptime_percentage NUMERIC(5,2) DEFAULT 99.90,
    rank INTEGER DEFAULT 99,
    description TEXT,
    long_description TEXT,
    rules TEXT[] DEFAULT ARRAY[]::TEXT[],
    features JSONB DEFAULT '[]'::JSONB,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Player History Table (for historical activity charts and peak calculations)
CREATE TABLE IF NOT EXISTS player_history (
    id BIGSERIAL PRIMARY KEY,
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    player_count INTEGER NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Votes Table (with IP hash for 24h rate-limit protection)
CREATE TABLE IF NOT EXISTS votes (
    id BIGSERIAL PRIMARY KEY,
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Performance Indexes (Rules.md #35)
CREATE INDEX IF NOT EXISTS idx_servers_slug ON servers(slug);
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_game ON servers(game);
CREATE INDEX IF NOT EXISTS idx_servers_server_type ON servers(server_type);
CREATE INDEX IF NOT EXISTS idx_servers_country ON servers(country);
CREATE INDEX IF NOT EXISTS idx_servers_region ON servers(region);
CREATE INDEX IF NOT EXISTS idx_servers_language ON servers(language);
CREATE INDEX IF NOT EXISTS idx_servers_current_players ON servers(current_players DESC);
CREATE INDEX IF NOT EXISTS idx_servers_vote_count ON servers(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_servers_rank ON servers(rank ASC);
CREATE INDEX IF NOT EXISTS idx_servers_created_at ON servers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_servers_tags ON servers USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_player_history_server_time ON player_history(server_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_server_ip_time ON votes(server_id, ip_hash, created_at DESC);

-- 6. Row Level Security (RLS)
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Public servers are viewable by everyone" ON servers;
CREATE POLICY "Public servers are viewable by everyone" ON servers
    FOR SELECT USING (true);

-- Public server submission access (Rules.md #36)
DROP POLICY IF EXISTS "Public can submit servers" ON servers;
CREATE POLICY "Public can submit servers" ON servers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public player history is viewable by everyone" ON player_history;
CREATE POLICY "Public player history is viewable by everyone" ON player_history
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public votes are viewable by everyone" ON votes;
CREATE POLICY "Public votes are viewable by everyone" ON votes
    FOR SELECT USING (true);

-- 7. Voting Function with 24-hour rate limit per IP hash
CREATE OR REPLACE FUNCTION cast_server_vote(p_server_id UUID, p_ip_hash TEXT)
RETURNS JSONB AS $$
DECLARE
    v_last_vote TIMESTAMPTZ;
    v_new_votes INTEGER;
BEGIN
    SELECT created_at INTO v_last_vote
    FROM votes
    WHERE server_id = p_server_id AND ip_hash = p_ip_hash
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_last_vote IS NOT NULL AND v_last_vote > (now() - INTERVAL '24 hours') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'You have already voted for this server in the last 24 hours.'
        );
    END IF;

    INSERT INTO votes (server_id, ip_hash) VALUES (p_server_id, p_ip_hash);
    
    UPDATE servers
    SET vote_count = vote_count + 1, updated_at = now()
    WHERE id = p_server_id
    RETURNING vote_count INTO v_new_votes;

    RETURN jsonb_build_object(
        'success', true,
        'new_vote_count', v_new_votes,
        'message', 'Vote registered successfully!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Initial Verified Seed Data (Safe Upsert)
INSERT INTO servers (
    id, slug, name, ip, port, game, game_version, platform, server_type, game_mode,
    region, country, language, tags, website_url, discord_url, banner_url, logo_url,
    current_players, max_players, status, vote_count, review_count, uptime_percentage, rank,
    description, long_description, rules, features, is_verified
) VALUES
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'eclipse-roleplay',
    'Eclipse Roleplay | Whitelist | Custom Cars',
    'play.eclipse-rp.net',
    30120,
    'GTA 5',
    'v1.0.3095',
    'FiveM',
    'Roleplay',
    'Serious RP',
    'Europe',
    'Germany',
    'German',
    ARRAY['Roleplay', 'Hardcore Economy', 'Custom Cars', 'Voice Chat', 'Whitelist', 'Active Admins', 'Serious RP'],
    'https://eclipse-rp.net',
    'https://discord.gg/eclipserp',
    NULL,
    '/assets/servers/server_1.png',
    612,
    1000,
    'online',
    3420,
    148,
    99.98,
    1,
    'Serious RP · Custom Economy · Active Development',
    'Welcome to Eclipse Roleplay, premier hardcore FiveM roleplay community. Experience a living, breathing virtual Los Santos with dynamic economy, police dispatch, tuned vehicles, and player businesses.',
    ARRAY['Strict In-Character voice roleplay required at all times.', 'Value of Life rules are strictly enforced.', 'Metagaming results in permanent ban.', 'VDM and RDM without IC conflict are prohibited.'],
    '[{"title":"Economy System","description":"Balanced player-driven financial ecosystem."},{"title":"Custom Vehicles","description":"Over 250 handcrafted vehicles with tuned physics."},{"title":"Law Enforcement & EMS","description":"Deep dispatch with custom CAD/MDT systems."}]'::JSONB,
    true
),
(
    'a89c201b-92ea-4d83-b912-1f03c3d4e580',
    'vanilla-unleashed',
    'Vanilla Unleashed | Freeroam | No Rules',
    'play.vanilla-unleashed.com',
    30120,
    'GTA 5',
    'v1.0.3095',
    'FiveM',
    'Freeroam',
    'Freeroam',
    'Europe',
    'Europe',
    'English',
    ARRAY['Freeroam', 'Custom Scripts', 'Custom Cars', 'Active Admins'],
    'https://vanilla-unleashed.com',
    'https://discord.gg/vanilla',
    NULL,
    '/assets/servers/server_2.png',
    478,
    800,
    'online',
    2890,
    112,
    99.95,
    2,
    'No Rules · No Pay2Win · Pure Fun',
    'Pure open-world chaos, drift tracks, supercars, and fun with friends without any whitelists or restrictions.',
    ARRAY['No cheat menus or third-party injectors.', 'No chat spamming in global frequencies.', 'Respect airport spawn safe zone.'],
    '[{"title":"Custom Framework","description":"Proprietary scripts offering high FPS and smooth sync."},{"title":"Instant Vehicle Spawner","description":"Customized drift handling profiles."}]'::JSONB,
    true
),
(
    'b12d304c-19fa-4e94-c823-2e04d4e5f691',
    'los-santos-streetz-rp',
    'Los Santos Streetz RP | Serious RP',
    'connect.streetzrp.de',
    30120,
    'GTA 5',
    'v1.0.3095',
    'FiveM',
    'Roleplay',
    'Serious RP',
    'Europe',
    'Germany',
    'German',
    ARRAY['Roleplay', 'Custom Cars', 'Economy System', 'Voice Chat', 'Serious RP'],
    'https://streetzrp.de',
    'https://discord.gg/streetzrp',
    NULL,
    '/assets/servers/server_3.png',
    389,
    700,
    'online',
    2150,
    89,
    99.88,
    3,
    'Serious RP · Gangs · Drugs · Economy',
    'Urban, fast-paced German roleplay server with underground street races, deep gang politics, and custom clothing.',
    ARRAY['18+ community policy.', 'Character death requires consent or trial by court.', 'Microphone and SaltyChat mandatory.'],
    '[{"title":"Underground Racing","description":"Tuner meets, drag strips, and pink-slip races."},{"title":"Custom EUP Clothing","description":"Over 5,000 apparel choices."}]'::JSONB,
    true
),
(
    'c23e405d-20fb-5f05-d934-3f05e5f6a702',
    'impulse99-stunt-race',
    'Impulse99 Stunt & Race',
    'play.impulse99.com',
    30120,
    'GTA 5',
    'v1.0.3095',
    'FiveM',
    'Racing',
    'Stunts & Races',
    'Europe',
    'Europe',
    'English',
    ARRAY['Racing', 'Freeroam', 'Custom Scripts', 'Mini Games'],
    'https://impulse99.com',
    'https://discord.gg/impulse99',
    NULL,
    '/assets/servers/server_4.png',
    256,
    500,
    'online',
    1840,
    65,
    99.92,
    4,
    'Stunt Races · Parkour · Racing · Leaderboards',
    'Thousands of community-built stunt races, loopings, and sky-high parkour courses with real-time tournament leaderboards.',
    ARRAY['No intentional ramming in ghosting mode.', 'Respect race lobby admins.'],
    '[{"title":"Mega Ramps & Stunt Loops","description":"Thousands of loopings and tracks."},{"title":"Live Leaderboards","description":"Track best lap times and win prizes."}]'::JSONB,
    true
),
(
    'd34f506e-31ac-6016-ea45-4a06f6a7b813',
    'grand-mafia-rp',
    'Grand Mafia RP | Whitelist',
    'play.grandmafia.de',
    30120,
    'GTA 5',
    'v1.0.3095',
    'FiveM',
    'Roleplay',
    'Serious RP',
    'Europe',
    'Germany',
    'German',
    ARRAY['Roleplay', 'Whitelist', 'Serious RP', 'Voice Chat', 'Economy System'],
    'https://grandmafia.de',
    'https://discord.gg/grandmafia',
    NULL,
    '/assets/servers/server_5.png',
    201,
    400,
    'online',
    1620,
    78,
    99.99,
    5,
    'Mafia RP · Families · Businesses · Smuggling',
    'High standard whitelist application process dedicated to organized crime roleplay, cartel operations, and judicial court cases.',
    ARRAY['Strict whitelist application required.', 'Organized crime heists require staff approval.'],
    '[{"title":"Mafia Families","description":"Exclusive gang territories and illegal manufacturing."}]'::JSONB,
    true
),
(
    'e45a607f-42bd-7127-fb56-5b07a7b8c924',
    'dm-city',
    'DM City | 1v1 & Gun Game',
    'connect.dmcity.eu',
    30120,
    'GTA 5',
    'v1.0.3095',
    'FiveM',
    'PvP',
    'DM / PvP',
    'Europe',
    'Europe',
    'English',
    ARRAY['PvP', 'Custom Scripts', 'Active Admins'],
    'https://dmcity.eu',
    'https://discord.gg/dmcity',
    NULL,
    '/assets/servers/server_6.png',
    178,
    300,
    'online',
    1390,
    42,
    99.85,
    6,
    'DM Arena · Gun Game · 1v1 · First to 100',
    'Instant respawn deathmatch arenas, custom weapon ballistics, 1v1 ranked duels, and Elo leaderboards.',
    ARRAY['No cheating, crosshair overlays or macro abuse.', 'Respect 1v1 arena rules.'],
    '[{"title":"Ranked Elo 1v1","description":"Competitive matchmaking and leaderboards."}]'::JSONB,
    false
),
(
    'f56b7080-53ce-8238-0c67-6c08b8c9d035',
    'bahamas-island-rp',
    'Bahamas Island RP | Semi-Serious',
    'play.bahamas-rp.de',
    30120,
    'GTA 5',
    'v1.0.3095',
    'FiveM',
    'Roleplay',
    'Semi-Serious RP',
    'Europe',
    'Germany',
    'German',
    ARRAY['Roleplay', 'Custom Cars', 'Economy System', 'Voice Chat'],
    'https://bahamas-rp.de',
    'https://discord.gg/bahamas',
    NULL,
    '/assets/servers/server_7.png',
    143,
    300,
    'online',
    980,
    31,
    99.91,
    7,
    'Semi-Serious RP · Island Life · Jobs · Vehicles',
    'Custom Caribbean island extension, boat docks, luxury beach resorts, legal jobs, and relaxed roleplay.',
    ARRAY['Voice chat required.', 'No griefing or spawn camping.'],
    '[{"title":"Tropical Island Setting","description":"Custom Caribbean map extensions and beach resorts."}]'::JSONB,
    false
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    current_players = EXCLUDED.current_players,
    max_players = EXCLUDED.max_players,
    vote_count = EXCLUDED.vote_count,
    updated_at = now();
