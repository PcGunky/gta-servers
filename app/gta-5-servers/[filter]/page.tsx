import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllServers, getCategoryCounts } from '@/lib/data';
import ServerDirectory from '@/components/ServerDirectory';
import JsonLd from '@/components/JsonLd';

interface PageProps {
  params: {
    filter: string;
  };
}

export const dynamic = 'force-dynamic';

interface FilterMeta {
  title: string;
  h1: string;
  description: string;
  categoryKey?: string;
  countryKey?: string;
  languageKey?: string;
}

const FILTER_CONFIG: Record<string, FilterMeta> = {
  roleplay: {
    title: 'GTA 5 Roleplay Servers — Best FiveM RP Servers',
    h1: 'GTA 5 ROLEPLAY SERVERS',
    description: 'Browse the highest rated GTA 5 roleplay servers. Discover realistic economy systems, active police & EMS departments, custom vehicles, and voice roleplay.',
    categoryKey: 'roleplay'
  },
  freeroam: {
    title: 'GTA 5 Freeroam & Stunt Servers — Open World FiveM',
    h1: 'GTA 5 FREEROAM & STUNT SERVERS',
    description: 'Explore open-world GTA 5 freeroam servers with instant car spawners, mega ramps, drift tracks, and custom stunt arenas.',
    categoryKey: 'freeroam'
  },
  pvp: {
    title: 'GTA 5 PvP & Gang War Servers — FiveM Combat',
    h1: 'GTA 5 PVP & GANG WAR SERVERS',
    description: 'Join competitive FiveM PvP servers with custom weapon ballistics, turf wars, gang territories, and fast-paced gunplay.',
    categoryKey: 'pvp'
  },
  dm: {
    title: 'GTA 5 Deathmatch & PvP Servers — FiveM Combat',
    h1: 'GTA 5 DM / PVP SERVERS',
    description: 'Join competitive FiveM Deathmatch and PvP servers with arena combat, custom weapon loadouts, and turf wars.',
    categoryKey: 'pvp'
  },
  racing: {
    title: 'GTA 5 Racing Servers — FiveM Street & Track Racing',
    h1: 'GTA 5 RACING SERVERS',
    description: 'Find top-tier GTA 5 and FiveM racing servers. Circuit tracks, drag racing strips, custom vehicle physics, and competitive tournament leaderboards.',
    categoryKey: 'racing'
  },
  stuntracing: {
    title: 'GTA 5 Stunt Racing Servers — Mega Ramps & Sky Tracks',
    h1: 'GTA 5 STUNT RACING SERVERS',
    description: 'Discover extreme GTA 5 stunt racing servers with loops, mega parkour courses, floating sky ramps, and wall-ride tracks in FiveM.',
    categoryKey: 'stunt'
  },
  other: {
    title: 'GTA 5 Custom & Specialty Servers — FiveM Community',
    h1: 'GTA 5 OTHER & COMMUNITY SERVERS',
    description: 'Explore unique GTA 5 and FiveM multiplayer servers featuring custom mini-games, zombie survival, military combat, and roleplay sandboxes.',
    categoryKey: 'other'
  },
  germany: {
    title: 'German GTA 5 Servers — Deutsche FiveM Server Liste',
    h1: 'GERMAN GTA 5 & FIVEM SERVERS',
    description: 'Die besten deutschen GTA 5 Roleplay- und Freeroam-Server im Überblick. Aktuelle Spielerzahlen, Teamspeak/SaltyChat Anbindung und Direkt-Connect.',
    countryKey: 'germany'
  },
  english: {
    title: 'English GTA 5 Servers — Global FiveM Community',
    h1: 'ENGLISH GTA 5 & FIVEM SERVERS',
    description: 'Find international English-speaking GTA 5 and FiveM multiplayer servers with thousands of active players and regular updates.',
    languageKey: 'english'
  },
  usa: {
    title: 'USA GTA 5 Servers — Top American FiveM Communities',
    h1: 'UNITED STATES GTA 5 SERVERS',
    description: 'Discover top American GTA 5 servers with low ping across North America, custom emergency vehicles, and thriving roleplay cities.',
    countryKey: 'united states'
  },
  europe: {
    title: 'European GTA 5 Servers — Europe FiveM Directory',
    h1: 'EUROPEAN GTA 5 SERVERS',
    description: 'Browse the largest European GTA 5 servers with dedicated European hosting and active multilingual communities.',
    countryKey: 'europe'
  },
  best: {
    title: 'Best GTA 5 Servers — Top Ranked FiveM Servers',
    h1: 'BEST GTA 5 & FIVEM SERVERS (TOP RANKED)',
    description: 'The definitive ranking of the best Grand Theft Auto V multiplayer servers, evaluated by player popularity, uptime reliability, and community votes.',
    categoryKey: 'all'
  }
};

export async function generateStaticParams() {
  return Object.keys(FILTER_CONFIG).map((filter) => ({
    filter,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const config = FILTER_CONFIG[params.filter.toLowerCase()];
  if (!config) {
    return { title: 'Servers — GTA SERVERS' };
  }

  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: `https://gtagameservers.com/gta-5-servers/${params.filter.toLowerCase()}`,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `https://gtagameservers.com/gta-5-servers/${params.filter.toLowerCase()}`,
    }
  };
}

export default async function ProgrammaticCategoryPage({ params }: PageProps) {
  const filterKey = params.filter.toLowerCase();
  const config = FILTER_CONFIG[filterKey];

  if (!config) {
    notFound();
  }

  const [rawServers, categoryCounts] = await Promise.all([
    getAllServers({
      category: config.categoryKey,
      country: config.countryKey,
      language: config.languageKey,
      sort: filterKey === 'best' ? 'votes' : 'players'
    }),
    getCategoryCounts()
  ]);

  const { fetchFiveMStatus } = await import('@/lib/fivem');
  const servers = await Promise.all(
    rawServers.map(async (s) => {
      if (s.platform === 'FiveM' && (s.cfx_code || s.ip)) {
        try {
          const live = await fetchFiveMStatus({
            cfxOrInput: s.cfx_code || undefined,
            ip: s.ip && !s.ip.includes('cfx.re') ? s.ip : undefined,
            port: s.port
          });
          if (live && live.online) {
            return {
              ...s,
              current_players: live.players,
              max_players: live.maxPlayers > 0 ? live.maxPlayers : s.max_players,
              status: 'online' as const,
              logo_url: s.logo_url || live.logoUrl
            };
          }
        } catch {}
      }
      return s;
    })
  );

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gtagameservers.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'GTA 5 Servers',
        item: 'https://gtagameservers.com/gta-5-servers'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: config.h1,
        item: `https://gtagameservers.com/gta-5-servers/${filterKey}`
      }
    ]
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.h1,
    numberOfItems: servers.length,
    itemListElement: servers.map((s, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: s.name,
      url: `https://gtagameservers.com/server/${s.slug}`
    }))
  };

  return (
    <>
      <JsonLd data={breadcrumbsSchema} />
      <JsonLd data={itemListSchema} />

      <ServerDirectory
        initialServers={servers}
        categoryTitle={config.h1}
        currentCategorySlug={filterKey}
        categoryCounts={categoryCounts}
      />
    </>
  );
}
