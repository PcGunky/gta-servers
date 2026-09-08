'use client';

import React from 'react';
import Link from 'next/link';
import { ServerEntity } from '@/lib/types';
import CountryFlag, { getCountryCode } from './CountryFlag';

interface ServerCardProps {
  server: ServerEntity;
  rank?: number;
}

export default function ServerCard({ server, rank }: ServerCardProps) {
  const displayRank = rank || server.rank || 1;
  const percentage = Math.min(100, Math.round((server.current_players / (server.max_players || 1)) * 100));
  const countryCode = getCountryCode(server.country);

  return (
    <article className="server-row-card" data-id={server.id}>
      <div className="server-rank-num">{displayRank}</div>
      
      <div className="server-info-block">
        {server.banner_url ? (
          <Link 
            href={`/server/${server.slug}`} 
            className="server-banner-link" 
            aria-label={server.name}
          >
            <img
              src={server.banner_url}
              alt={`${server.name} Banner`}
              className="server-banner-thumb"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
                if (target.parentElement) target.parentElement.style.display = 'none';
              }}
            />
          </Link>
        ) : (
          <Link 
            href={`/server/${server.slug}`} 
            className="server-avatar-link" 
            aria-label={server.name}
          >
            <img
              src={server.logo_url || '/assets/servers/server_1.png'}
              alt={`${server.name} Logo`}
              className="server-avatar-thumb"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/assets/servers/server_1.png';
              }}
            />
          </Link>
        )}
        <div className="server-details">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 className="server-title">
              <Link href={`/server/${server.slug}`} className="server-title-link">
                {server.name}
              </Link>
            </h3>
            {server.cfx_code && (
              <a
                href={`https://cfx.re/join/${server.cfx_code}`}
                className="cfx-optional-badge"
                title={`One-Click Connect: cfx.re/join/${server.cfx_code}`}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', fontSize: '9.5px', padding: '1px 5px' }}
              >
                ⚡ CFX
              </a>
            )}
          </div>
          <p className="server-subtitle">{server.description}</p>
        </div>
      </div>

      <div className="server-players-cell">
        <div className="player-count-text">
          <span className="current-players">{server.current_players}</span> / {server.max_players}
        </div>
        <div className="player-bar-track">
          <div className="player-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      <div className="server-region-cell" title={server.country}>
        <CountryFlag country={server.country} />
        <span className="region-code">{countryCode}</span>
      </div>

      <div className="server-conn-cell">
        <div className="signal-bars">
          <span className="bar bar-1"></span>
          <span className="bar bar-2"></span>
          <span className="bar bar-3"></span>
          <span className="bar bar-4"></span>
        </div>
      </div>
    </article>
  );
}
