import React from 'react';
import type { Metadata } from 'next';
import { getAllServers } from '@/lib/data';
import ServerDirectory from '@/components/ServerDirectory';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'GTA 5 Servers — Complete GTA V & FiveM Multiplayer Directory',
  description: 'Explore all verified GTA 5 multiplayer servers. Filter by Roleplay, Freeroam, PvP, language, and country. Find your next favorite community today.',
  alternates: {
    canonical: 'https://gtagameservers.com/gta-5-servers',
  }
};

export const revalidate = 60;

export default async function Gta5ServersHubPage() {
  const servers = await getAllServers();

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
      }
    ]
  };

  return (
    <>
      <JsonLd data={breadcrumbsSchema} />

      <ServerDirectory
        initialServers={servers}
        categoryTitle="ALL GRAND THEFT AUTO V SERVERS"
        currentCategorySlug="all"
      />
    </>
  );
}
