import React from 'react';
import type { Metadata } from 'next';
import { getAllServers, getCategoryCounts } from '@/lib/data';
import ServerDirectory from '@/components/ServerDirectory';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'GTA 5 Servers — Best GTA V & FiveM Server List',
  description: 'Browse the top-ranked GTA 5 and FiveM multiplayer servers. Check live online player counts, ping, economy features, and connect in seconds.',
  alternates: {
    canonical: 'https://gtagameservers.com/',
  }
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let servers = await getAllServers();
  
  // Resolve live FiveM status so homepage ALWAYS displays the exact same numbers as the server detail page
  const { fetchFiveMStatus } = await import('@/lib/fivem');
  servers = await Promise.all(
    servers.map(async (s) => {
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

  const categoryCounts = await getCategoryCounts(servers);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GTA Game Servers',
    url: 'https://gtagameservers.com',
    description: 'The premier directory for GTA 5, GTA 6, and FiveM multiplayer servers.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://gtagameservers.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Rated GTA 5 & FiveM Servers',
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
      <JsonLd data={websiteSchema} />
      <JsonLd data={itemListSchema} />

      {/* Main Server Directory Grid matching index.html */}
      <ServerDirectory
        initialServers={servers}
        categoryTitle="ALL GTA V SERVERS"
        currentCategorySlug="all"
        categoryCounts={categoryCounts}
      />
    </>
  );
}
