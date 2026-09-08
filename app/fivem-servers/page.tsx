import React from 'react';
import type { Metadata } from 'next';
import { getAllServers } from '@/lib/data';
import ServerDirectory from '@/components/ServerDirectory';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'FiveM Servers — Best FiveM Server List & Rankings',
  description: 'Search and connect to the top FiveM GTA V multiplayer servers. Detailed player history, ping stats, custom scripts, and direct connect commands.',
  alternates: {
    canonical: 'https://gtagameservers.com/fivem-servers',
  }
};

export const revalidate = 60;

export default async function FivemServersPage() {
  const servers = await getAllServers({ platform: 'FiveM' });

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
