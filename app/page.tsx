import React from 'react';
import type { Metadata } from 'next';
import { getAllServers, getCategoryCounts } from '@/lib/data';
import ServerDirectory from '@/components/ServerDirectory';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'GTA 5 Servers — Best GTA V & FiveM Server List',
  description: 'Browse the top-ranked GTA 5 and FiveM multiplayer servers. Check live online player counts, ping, economy features, and connect in seconds.',
  alternates: {
    canonical: 'https://gtaservers.io/',
  }
};

export const revalidate = 60;

export default async function HomePage() {
  const servers = await getAllServers();
  const categoryCounts = await getCategoryCounts(servers);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GTA Game Servers',
    url: 'https://gtaservers.io',
    description: 'The premier directory for GTA 5, GTA 6, and FiveM multiplayer servers.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://gtaservers.io/search?q={search_term_string}',
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
      url: `https://gtaservers.io/server/${s.slug}`
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
