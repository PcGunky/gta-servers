import React from 'react';
import type { Metadata } from 'next';
import { getAllServers, updateServerLiveStatus, recordPlayerSnapshot } from '@/lib/data';
import ServerDirectory from '@/components/ServerDirectory';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'FiveM Servers — Best FiveM Server List & Rankings',
  description: 'Search and connect to the top FiveM GTA V multiplayer servers. Detailed player history, ping stats, custom scripts, and direct connect commands.',
  alternates: {
    canonical: 'https://gtagameservers.com/fivem-servers',
  }
};

export const dynamic = 'force-dynamic';

export default async function FivemServersPage() {
  let servers = await getAllServers({ platform: 'FiveM' });
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
            updateServerLiveStatus(s.id, {
              current_players: live.players,
              max_players: live.maxPlayers > 0 ? live.maxPlayers : s.max_players,
              status: 'online',
              logo_url: live.logoUrl
            }).catch(() => {});

            recordPlayerSnapshot(s.id, live.players).catch(() => {});

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
        name: 'FiveM Servers',
        item: 'https://gtagameservers.com/fivem-servers'
      }
    ]
  };

  return (
    <>
      <JsonLd data={breadcrumbsSchema} />

      <ServerDirectory
        initialServers={servers}
        categoryTitle="FIVEM MULTIPLAYER SERVERS"
        currentCategorySlug="all"
      />
    </>
  );
}
