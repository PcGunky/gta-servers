// Seed data for GTA Game Servers
// Matches exact servers from index.html & server.html with 100% design fidelity

import { ServerEntity } from './types';

export const INITIAL_SERVERS: ServerEntity[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    slug: 'eclipse-roleplay',
    name: 'Eclipse Roleplay | Whitelist | Custom Cars',
    ip: 'play.eclipse-rp.net',
    port: 30120,
    game: 'GTA 5',
    game_version: 'v1.0.3095',
    platform: 'FiveM',
    server_type: 'Roleplay',
    game_mode: 'Serious RP',
    region: 'Europe',
    country: 'Germany',
    language: 'German',
    tags: ['Roleplay', 'Hardcore Economy', 'Custom Cars', 'Voice Chat', 'Whitelist', 'Active Admins', 'Serious RP'],
    website_url: 'https://eclipse-rp.net',
    discord_url: 'https://discord.gg/eclipserp',
    banner_url: undefined,
    logo_url: '/assets/servers/server_1.png',
    current_players: 612,
    max_players: 1000,
    status: 'online',
    vote_count: 3420,
    review_count: 148,
    uptime_percentage: 99.98,
    rank: 1,
    is_verified: true,
    description: 'Serious RP · Custom Economy · Active Development',
    long_description: 'Welcome to Eclipse Roleplay, Germany’s premier hardcore FiveM roleplay community. Experience a living, breathing virtual Los Santos where every decision impacts the city economy and political landscape. Featuring an advanced legal framework, dedicated police and medical dispatch systems, fully custom-tuned vehicles, dynamic player housing, and sophisticated criminal operations.',
    rules: [
      'Strict In-Character (IC) voice roleplay required at all times.',
      'Value of Life (FailRP / FearRP) rules are strictly enforced.',
      'Metagaming and stream-sniping will result in an immediate permanent ban.',
      'Vehicle Deathmatch (VDM) and Random Deathmatch (RDM) without prior IC conflict are prohibited.',
      'All criminal heists require registered gang membership or prior staff ticket.'
    ],
    features: [
      {
        title: 'Economy System',
        description: 'Balanced player-driven financial ecosystem with realistic pricing, businesses, and banking mechanics.'
      },
      {
        title: 'Custom Vehicles',
        description: 'Over 250 handcrafted, lore-friendly and real-world vehicle models with tuned handling physics.'
      },
      {
        title: 'Law Enforcement & EMS',
        description: 'Deep roleplay dispatching with custom CAD/MDT systems, forensic tools, and court trials.'
      },
      {
        title: 'Illegal Activities & Gangs',
        description: 'Fully customizable gang territories, drug harvesting, weapon crafting, and heist mechanics.'
      },
      {
        title: 'Housing & Real Estate',
        description: 'Furnishable apartments, luxury villas, and warehouse properties with keyholder access.'
      },
      {
        title: 'Active Community',
        description: 'Daily events, experienced administration, strict roleplay rules, and weekly updates.'
      }
    ],
    player_history: [
      { time: '00:00', count: 520 },
      { time: '02:00', count: 410 },
      { time: '04:00', count: 320 },
      { time: '06:00', count: 240 },
      { time: '08:00', count: 350 },
      { time: '10:00', count: 450 },
      { time: '12:00', count: 540 },
      { time: '14:00', count: 580 },
      { time: '16:00', count: 605 },
      { time: '18:00', count: 612 },
      { time: '20:00', count: 610 },
      { time: '22:00', count: 580 }
    ],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2026-09-07T08:00:00Z'
  },
  {
    id: 'a89c201b-92ea-4d83-b912-1f03c3d4e580',
    slug: 'vanilla-unleashed',
    name: 'Vanilla Unleashed | Freeroam | No Rules',
    ip: 'play.vanilla-unleashed.com',
    port: 30120,
    game: 'GTA 5',
    game_version: 'v1.0.3095',
    platform: 'FiveM',
    server_type: 'Freeroam',
    game_mode: 'Freeroam',
    region: 'Europe',
    country: 'Europe',
    language: 'English',
    tags: ['Freeroam', 'Custom Scripts', 'Custom Cars', 'Active Admins'],
    website_url: 'https://vanilla-unleashed.com',
    discord_url: 'https://discord.gg/vanilla',
    banner_url: undefined,
    logo_url: '/assets/servers/server_2.png',
    current_players: 478,
    max_players: 800,
    status: 'online',
    vote_count: 2890,
    review_count: 112,
    uptime_percentage: 99.95,
    rank: 2,
    is_verified: true,
    description: 'No Rules · No Pay2Win · Pure Fun',
    long_description: 'Hop in and enjoy pure chaos, drift tracks, supercars, and fun with friends without any whitelists or restrictions.',
    rules: [
      'No cheat menus or third-party injectors (automated anticheat enabled).',
      'No chat spamming or hate speech in global frequencies.',
      'Respect safe zones around the Los Santos International Airport spawn hub.'
    ],
    features: [
      {
        title: 'Custom Framework',
        description: 'Proprietary scripts offering high FPS, smooth sync, and zero desync issues.'
      },
      {
        title: 'Custom Vehicles',
        description: 'Instant vehicle spawner with customized tuning and drift handling profiles.'
      }
    ],
    player_history: [
      { time: '00:00', count: 420 },
      { time: '02:00', count: 340 },
      { time: '04:00', count: 280 },
      { time: '06:00', count: 220 },
      { time: '08:00', count: 310 },
      { time: '10:00', count: 370 },
      { time: '12:00', count: 410 },
      { time: '14:00', count: 440 },
      { time: '16:00', count: 460 },
      { time: '18:00', count: 478 },
      { time: '20:00', count: 470 },
      { time: '22:00', count: 450 }
    ],
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2026-09-07T08:00:00Z'
  },
  {
    id: 'b12d304c-19fa-4e94-c823-2e04d4e5f691',
    slug: 'los-santos-streetz-rp',
    name: 'Los Santos Streetz RP | Serious RP',
    ip: 'connect.streetzrp.de',
    port: 30120,
    game: 'GTA 5',
    game_version: 'v1.0.3095',
    platform: 'FiveM',
    server_type: 'Roleplay',
    game_mode: 'Serious RP',
    region: 'Europe',
    country: 'Germany',
    language: 'German',
    tags: ['Roleplay', 'Custom Cars', 'Economy System', 'Voice Chat', 'Serious RP'],
    website_url: 'https://streetzrp.de',
    discord_url: 'https://discord.gg/streetzrp',
    banner_url: undefined,
    logo_url: '/assets/servers/server_3.png',
    current_players: 389,
    max_players: 700,
    status: 'online',
    vote_count: 2150,
    review_count: 89,
    uptime_percentage: 99.88,
    rank: 3,
    is_verified: true,
    description: 'Serious RP · Gangs · Drugs · Economy',
    long_description: 'Urban, fast-paced German roleplay server with underground street races, deep gang politics, and custom clothing.',
    rules: [
      'Mature players only (18+ community policy).',
      'Character death requires consent or trial by judicial court.',
      'Microphone and SaltyChat mandatory.'
    ],
    features: [
      {
        title: 'Underground Racing',
        description: 'Tuner meets, drag strips, drifting leaderboards, and vehicle pink-slip races.'
      },
      {
        title: 'Custom EUP Clothing',
        description: 'Over 5,000 custom apparel choices, designer streetwear, and tactical gear.'
      }
    ],
    player_history: [
      { time: '00:00', count: 320 },
      { time: '02:00', count: 250 },
      { time: '04:00', count: 210 },
      { time: '06:00', count: 180 },
      { time: '08:00', count: 260 },
      { time: '10:00', count: 310 },
      { time: '12:00', count: 340 },
      { time: '14:00', count: 360 },
      { time: '16:00', count: 375 },
      { time: '18:00', count: 389 },
      { time: '20:00', count: 380 },
      { time: '22:00', count: 350 }
    ],
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2026-09-07T08:00:00Z'
  },
  {
    id: 'c23e405d-20fb-5f05-d934-3f05e5f6a702',
    slug: 'impulse99-stunt-race',
    name: 'Impulse99 Stunt & Race',
    ip: 'play.impulse99.com',
    port: 30120,
    game: 'GTA 5',
    game_version: 'v1.0.3095',
    platform: 'FiveM',
    server_type: 'Racing',
    game_mode: 'Stunts & Races',
    region: 'Europe',
    country: 'Europe',
    language: 'English',
    tags: ['Racing', 'Freeroam', 'Custom Scripts', 'Mini Games'],
    website_url: 'https://impulse99.com',
    discord_url: 'https://discord.gg/impulse99',
    banner_url: undefined,
    logo_url: '/assets/servers/server_4.png',
    current_players: 256,
    max_players: 500,
    status: 'online',
    vote_count: 1840,
    review_count: 65,
    uptime_percentage: 99.92,
    rank: 4,
    is_verified: true,
    description: 'Stunt Races · Parkour · Racing · Leaderboards',
    features: [
      {
        title: 'Mega Ramps & Stunt Loops',
        description: 'Thousands of community-built stunt races, loopings, and parkour tracks.'
      }
    ],
    player_history: [
      { time: '00:00', count: 210 },
      { time: '02:00', count: 160 },
      { time: '04:00', count: 140 },
      { time: '06:00', count: 110 },
      { time: '08:00', count: 170 },
      { time: '10:00', count: 200 },
      { time: '12:00', count: 220 },
      { time: '14:00', count: 235 },
      { time: '16:00', count: 245 },
      { time: '18:00', count: 256 },
      { time: '20:00', count: 250 },
      { time: '22:00', count: 230 }
    ],
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2026-09-07T08:00:00Z'
  },
  {
    id: 'd34f506e-31ac-6016-ea45-4a06f6a7b813',
    slug: 'grand-mafia-rp',
    name: 'Grand Mafia RP | Whitelist',
    ip: 'play.grandmafia.de',
    port: 30120,
    game: 'GTA 5',
    game_version: 'v1.0.3095',
    platform: 'FiveM',
    server_type: 'Roleplay',
    game_mode: 'Serious RP',
    region: 'Europe',
    country: 'Germany',
    language: 'German',
    tags: ['Roleplay', 'Whitelist', 'Serious RP', 'Voice Chat', 'Economy System'],
    website_url: 'https://grandmafia.de',
    discord_url: 'https://discord.gg/grandmafia',
    banner_url: undefined,
    logo_url: '/assets/servers/server_5.png',
    current_players: 201,
    max_players: 400,
    status: 'online',
    vote_count: 1620,
    review_count: 78,
    uptime_percentage: 99.99,
    rank: 5,
    is_verified: true,
    description: 'Mafia RP · Families · Businesses · Smuggling',
    features: [
      {
        title: 'Strict Whitelist',
        description: 'High standard application process for organized crime roleplay.'
      }
    ],
    player_history: [
      { time: '00:00', count: 180 },
      { time: '02:00', count: 130 },
      { time: '04:00', count: 90 },
      { time: '06:00', count: 70 },
      { time: '08:00', count: 110 },
      { time: '10:00', count: 140 },
      { time: '12:00', count: 160 },
      { time: '14:00', count: 175 },
      { time: '16:00', count: 190 },
      { time: '18:00', count: 201 },
      { time: '20:00', count: 195 },
      { time: '22:00', count: 185 }
    ],
    created_at: '2024-04-12T00:00:00Z',
    updated_at: '2026-09-07T08:00:00Z'
  },
  {
    id: 'e45a607f-42bd-7127-fb56-5b07a7b8c924',
    slug: 'dm-city',
    name: 'DM City | 1v1 & Gun Game',
    ip: 'connect.dmcity.eu',
    port: 30120,
    game: 'GTA 5',
    game_version: 'v1.0.3095',
    platform: 'FiveM',
    server_type: 'PvP',
    game_mode: 'DM / PvP',
    region: 'Europe',
    country: 'Europe',
    language: 'English',
    tags: ['PvP', 'Custom Scripts', 'Active Admins'],
    website_url: 'https://dmcity.eu',
    discord_url: 'https://discord.gg/dmcity',
    banner_url: undefined,
    logo_url: '/assets/servers/server_6.png',
    current_players: 178,
    max_players: 300,
    status: 'online',
    vote_count: 1390,
    review_count: 42,
    uptime_percentage: 99.85,
    rank: 6,
    is_verified: false,
    description: 'DM Arena · Gun Game · 1v1 · First to 100',
    features: [
      {
        title: 'Competitive Gunplay',
        description: 'Instant respawn deathmatch arenas, custom hit markers, and elo rankings.'
      }
    ],
    player_history: [
      { time: '00:00', count: 140 },
      { time: '02:00', count: 100 },
      { time: '04:00', count: 70 },
      { time: '06:00', count: 50 },
      { time: '08:00', count: 90 },
      { time: '10:00', count: 115 },
      { time: '12:00', count: 130 },
      { time: '14:00', count: 145 },
      { time: '16:00', count: 160 },
      { time: '18:00', count: 178 },
      { time: '20:00', count: 170 },
      { time: '22:00', count: 155 }
    ],
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2026-09-07T08:00:00Z'
  },
  {
    id: 'f56b7080-53ce-8238-0c67-6c08b8c9d035',
    slug: 'bahamas-island-rp',
    name: 'Bahamas Island RP | Semi-Serious',
    ip: 'play.bahamas-rp.de',
    port: 30120,
    game: 'GTA 5',
    game_version: 'v1.0.3095',
    platform: 'FiveM',
    server_type: 'Roleplay',
    game_mode: 'Semi-Serious RP',
    region: 'Europe',
    country: 'Germany',
    language: 'German',
    tags: ['Roleplay', 'Custom Cars', 'Economy System', 'Voice Chat'],
    website_url: 'https://bahamas-rp.de',
    discord_url: 'https://discord.gg/bahamas',
    banner_url: undefined,
    logo_url: '/assets/servers/server_7.png',
    current_players: 143,
    max_players: 300,
    status: 'online',
    vote_count: 980,
    review_count: 31,
    uptime_percentage: 99.91,
    rank: 7,
    is_verified: false,
    description: 'Semi-Serious RP · Island Life · Jobs · Vehicles',
    features: [
      {
        title: 'Tropical Island Setting',
        description: 'Custom Caribbean map extensions, boat docks, luxury resorts, and relaxed roleplay.'
      }
    ],
    player_history: [
      { time: '00:00', count: 120 },
      { time: '02:00', count: 85 },
      { time: '04:00', count: 60 },
      { time: '06:00', count: 45 },
      { time: '08:00', count: 75 },
      { time: '10:00', count: 95 },
      { time: '12:00', count: 110 },
      { time: '14:00', count: 125 },
      { time: '16:00', count: 135 },
      { time: '18:00', count: 143 },
      { time: '20:00', count: 138 },
      { time: '22:00', count: 130 }
    ],
    created_at: '2024-06-15T00:00:00Z',
    updated_at: '2026-09-07T08:00:00Z'
  }
];

export const CATEGORIES = [
  { id: 'all', slug: 'all', name: 'ALL SERVERS', description: 'Browse all active GTA V and FiveM servers.', count: 7 },
  { id: 'roleplay', slug: 'roleplay', name: 'ROLEPLAY', description: 'Immersive roleplay servers with custom jobs, economy, and legal systems.', count: 4 },
  { id: 'freeroam', slug: 'freeroam', name: 'FREEROAM', description: 'Casual open-world fun with car spawners, custom maps, and stunt ramps.', count: 2 },
  { id: 'pvp', slug: 'pvp', name: 'PVP & GANGWAR', description: 'Competitive combat, turf wars, and high-stakes action.', count: 1 },
  { id: 'germany', slug: 'germany', name: 'GERMAN SERVERS', description: 'Top German GTA V and FiveM communities.', count: 3 },
  { id: 'english', slug: 'english', name: 'ENGLISH SERVERS', description: 'International English-speaking GTA V communities.', count: 4 },
  { id: 'best', slug: 'best', name: 'TOP RANKED', description: 'Highest voted and most populated GTA servers.', count: 7 }
];
