import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllServers } from '@/lib/data';
import ServerDirectory from '@/components/ServerDirectory';

interface PageProps {
  searchParams: {
    q?: string;
  };
}

export const metadata: Metadata = {
  title: 'Search Servers — GTA SERVERS',
  description: 'Search for GTA 5 and FiveM multiplayer servers.',
  robots: {
    index: false,
    follow: true
  }
};

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q || '';
  const servers = await getAllServers({ search: query });

  return (
    <>
      <nav className="server-breadcrumbs" aria-label="Breadcrumb" style={{ marginTop: '28px', marginBottom: '16px' }}>
        <Link href="/" className="crumb-link">HOME</Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">SEARCH RESULTS</span>
      </nav>

      <ServerDirectory
        initialServers={servers}
        categoryTitle={query ? `Search Results for "${query}"` : 'All Servers'}
        categorySubtitle={`Found ${servers.length} server${servers.length === 1 ? '' : 's'} matching your search.`}
      />
    </>
  );
}
