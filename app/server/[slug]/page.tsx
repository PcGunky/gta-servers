import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllServers, getServerBySlug, getSimilarServers, recordPlayerSnapshot, formatHistoryTime } from '@/lib/data';
import { fetchFiveMStatus } from '@/lib/fivem';
import { fetchDiscordStats } from '@/lib/discord';
import ServerDetailClient from '@/components/ServerDetailClient';
import ServerTabs from '@/components/ServerTabs';
import VoteButton from '@/components/VoteButton';
import JsonLd from '@/components/JsonLd';

interface PageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 30;

export async function generateStaticParams() {
  const servers = await getAllServers();
  return servers.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const server = await getServerBySlug(params.slug);
  if (!server) {
    return {
      title: 'Server Not Found — GTA SERVERS',
    };
  }

  const title = `${server.name} — GTA 5 ${server.server_type} Server`;
  const description = `${server.name} is a verified ${server.game} ${server.server_type} server based in ${server.country}. Currently ${server.current_players}/${server.max_players} players online. View rules, IP, and connect.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://gtaservers.io/server/${server.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://gtaservers.io/server/${server.slug}`,
      images: [
        {
          url: server.banner_url || '/assets/herote.png',
          width: 800,
          height: 350,
          alt: `${server.name} Banner`,
        },
      ],
    },
  };
}

export default async function ServerPage({ params }: PageProps) {
  let server = await getServerBySlug(params.slug);
  if (!server) {
    notFound();
  }

  // Fetch live FiveM status and real Discord statistics in parallel
  const [liveFiveM, discordStats] = await Promise.all([
    server.platform === 'FiveM' && (server.cfx_code || server.ip)
      ? fetchFiveMStatus({
          cfxOrInput: server.cfx_code || undefined,
          ip: server.ip && !server.ip.includes('cfx.re') ? server.ip : undefined,
          port: server.port
        }).catch(() => null)
      : Promise.resolve(null),
    server.discord_url
      ? fetchDiscordStats(server.discord_url).catch(() => null)
      : Promise.resolve(null)
  ]);

  if (liveFiveM && liveFiveM.online) {
    // Record genuine snapshot in database telemetry
    recordPlayerSnapshot(server.id, liveFiveM.players).catch(() => {});

    // Ensure server.player_history has this latest genuine point
    const historyList = [...(server.player_history || [])];
    const nowIso = new Date().toISOString();
    const timeLabel = formatHistoryTime(nowIso);

    if (historyList.length === 0) {
      historyList.push({
        time: timeLabel,
        count: liveFiveM.players,
        recorded_at: nowIso
      });
    } else {
      const lastPoint = historyList[historyList.length - 1];
      const lastTime = lastPoint.recorded_at ? new Date(lastPoint.recorded_at).getTime() : 0;
      if (Date.now() - lastTime >= 60 * 60 * 1000) {
        historyList.push({
          time: timeLabel,
          count: liveFiveM.players,
          recorded_at: nowIso
        });
      } else {
        lastPoint.count = liveFiveM.players;
      }
    }

    server = {
      ...server,
      current_players: liveFiveM.players,
      max_players: liveFiveM.maxPlayers > 0 ? liveFiveM.maxPlayers : server.max_players,
      status: 'online',
      logo_url: server.logo_url || liveFiveM.logoUrl,
      player_history: historyList
    };
  }

  const similarServers = await getSimilarServers(server, 2);

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gtaservers.io'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${server.game} Servers`,
        item: 'https://gtaservers.io'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: server.name,
        item: `https://gtaservers.io/server/${server.slug}`
      }
    ]
  };

  const videoGameSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: server.name,
    operatingSystem: 'Windows',
    applicationCategory: 'GameServer',
    description: server.description,
    url: `https://gtaservers.io/server/${server.slug}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: server.review_count || 120,
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <>
      <JsonLd data={breadcrumbsSchema} />
      <JsonLd data={videoGameSchema} />

      {/* Breadcrumbs Navigation */}
      <nav className="server-breadcrumbs" aria-label="Breadcrumbs">
        <Link href="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">›</span>
        <Link href="/" className="breadcrumb-link">GTA V Servers</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current" id="crumb-server-name">{server.name}</span>
      </nav>

      {/* Server Hero Showcase Card & Live Bar */}
      <ServerDetailClient server={server} initialLatency={liveFiveM?.latencyMs} />

      {/* Content Grid: Sub-Tabs Column (Left) + Sidebar (Right) */}
      <div className="server-content-layout">
        {/* Left Major Column: Sub-Tabs & Detailed Content */}
        <div className="server-tabs-column">
          <ServerTabs server={server} />
        </div>

        {/* Right Column: Sidebar (Info, Voting, Similar) */}
        <aside className="server-sidebar">
          {/* Quick Info Panel */}
          <div className="sidebar-panel">
            <div className="panel-header">SERVER DETAILS</div>
            
            <div className="server-info-meta-list">
              <div className="meta-row">
                <span className="meta-key">{server.cfx_code ? 'Cfx Connect:' : 'Server IP:'}</span>
                <span className="meta-val meta-val-highlight" id="sidebar-ip-text">
                  {server.cfx_code ? `cfx.re/join/${server.cfx_code}` : `${server.ip}:${server.port}`}
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-key">Voice Chat:</span>
                <span className="meta-val">
                  {server.tags?.some(t => t.toLowerCase().includes('voice')) ? '3D Proximity (In-Game)' : 'Integrated'}
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-key">Discord:</span>
                <span className="meta-val">
                  {discordStats?.valid && discordStats.memberCount ? (
                    <a
                      href={server.discord_url || discordStats.inviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--brand-cyan)', textDecoration: 'none' }}
                      title={`${discordStats.onlineCount ? discordStats.onlineCount.toLocaleString() + ' online' : 'Discord community'}`}
                    >
                      {discordStats.memberCount.toLocaleString()} Members
                    </a>
                  ) : server.discord_url ? (
                    <a
                      href={server.discord_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--brand-cyan)', textDecoration: 'none' }}
                    >
                      Join Community
                    </a>
                  ) : (
                    'Community'
                  )}
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-key">Framework:</span>
                <span className="meta-val">{server.platform} ({server.game_mode})</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">Listed On:</span>
                <span className="meta-val">
                  {server.created_at
                    ? new Date(server.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'September 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Voting Card */}
          <VoteButton serverId={server.id} initialVotes={server.vote_count} />

          {/* Owner Claim & Verification Card */}
          <div className="sidebar-panel">
            <div className="panel-header">OWN THIS SERVER?</div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', lineHeight: '1.55', color: '#8a94a6' }}>
              Verify ownership to update custom banners, feature on the homepage, or manage sponsored placement.
            </p>
            <a
              href="https://discord.gg/VxmABVb9qk"
              target="_blank"
              rel="noopener noreferrer"
              id="btn-claim-server"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 14px',
                background: '#1a1d24',
                border: '1px solid #2a303c',
                borderRadius: '6px',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '12px',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z"/>
              </svg>
              Claim via Support Discord
            </a>
          </div>

          {/* Similar Recommended Servers */}
          {similarServers.length > 0 && (
            <div className="sidebar-panel">
              <div className="panel-header">OTHER POPULAR SERVERS</div>
              
              <div className="similar-servers-list">
                {similarServers.map((s) => (
                  <Link
                    key={s.id}
                    href={`/server/${s.slug}`}
                    className="similar-server-item"
                  >
                    <img
                      src={s.banner_url || '/assets/herote.png'}
                      alt={s.name}
                      className="similar-banner"
                    />
                    <div className="similar-details">
                      <span className="similar-title">{s.name}</span>
                      <span className="similar-stat">
                        {s.current_players} Players · {s.country.toLowerCase() === 'germany' ? 'DE' : 'EU'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
