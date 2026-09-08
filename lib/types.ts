// Type definitions for GTA Game Servers Directory
// Complies with Rules.md data schemas and structured entity requirements

export type ServerStatus = 'online' | 'offline' | 'maintenance';

export interface ServerFeature {
  title: string;
  description: string;
}

export interface PlayerHistoryPoint {
  time: string;
  count: number;
  recorded_at?: string;
}

export interface ServerEntity {
  id: string;
  slug: string;
  name: string;
  ip: string;
  port: number;
  game: string; // 'GTA 5' | 'GTA 6'
  game_version: string;
  platform: string; // 'FiveM' | 'RageMP' | 'alt:V'
  server_type: string; // 'Roleplay' | 'Freeroam' | 'PvP' | 'Racing' | 'Economy'
  game_mode: string;
  region: string; // 'Europe' | 'North America' | 'Global'
  country: string; // 'Germany' | 'United States' | 'United Kingdom'
  language: string; // 'German' | 'English'
  tags: string[];
  website_url?: string;
  discord_url?: string;
  banner_url?: string | null;
  logo_url?: string;
  cfx_code?: string | null;
  cfx_url?: string | null;
  current_players: number;
  max_players: number;
  status: ServerStatus;
  vote_count: number;
  review_count: number;
  uptime_percentage: number;
  description: string;
  long_description?: string;
  rules?: string[];
  features: ServerFeature[];
  player_history?: PlayerHistoryPoint[];
  is_verified: boolean;
  is_approved?: boolean;
  rank?: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryInfo {
  id: string;
  slug: string;
  name: string;
  description: string;
  count: number;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FilterParams {
  category?: string;
  country?: string;
  language?: string;
  game?: string;
  platform?: string;
  search?: string;
  sort?: 'rank' | 'players' | 'votes' | 'uptime';
  page?: number;
  limit?: number;
}
