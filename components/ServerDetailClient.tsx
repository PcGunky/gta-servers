'use client';

import React, { useState, useEffect } from 'react';
import { ServerEntity } from '@/lib/types';
import CountryFlag, { getCountryCode } from './CountryFlag';

export function showCopyToast(msg: string = 'Copied to clipboard!') {
  if (typeof document === 'undefined') return;
  const toast = document.getElementById('copy-toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    const timeoutId = (toast as unknown as { _timeout?: NodeJS.Timeout })._timeout;
    if (timeoutId) clearTimeout(timeoutId);
    (toast as unknown as { _timeout?: NodeJS.Timeout })._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }
}

interface ServerDetailClientProps {
  server: ServerEntity;
  initialLatency?: number;
}

export default function ServerDetailClient({ server, initialLatency }: ServerDetailClientProps) {
  const [livePlayers, setLivePlayers] = useState<number>(server.current_players);
  const [liveMaxPlayers, setLiveMaxPlayers] = useState<number>(server.max_players);
  const [liveStatus, setLiveStatus] = useState<string>(server.status);
  const [latency, setLatency] = useState<number>(initialLatency || 24);

  // Sync state if server prop updates
  useEffect(() => {
    setLivePlayers(server.current_players);
    setLiveMaxPlayers(server.max_players);
    setLiveStatus(server.status);
    if (initialLatency) setLatency(initialLatency);
  }, [server.current_players, server.max_players, server.status, initialLatency]);

  // Periodic polite background live poll (every 45s) for live players & latency
  useEffect(() => {
    if (server.platform !== 'FiveM' && !server.cfx_code) return;

    const interval = setInterval(async () => {
      try {
        const queryTarget = server.cfx_code || server.ip;
        const res = await fetch(`/api/servers/ping?cfx=${encodeURIComponent(queryTarget)}&ip=${encodeURIComponent(server.ip)}&port=${server.port}`);
        if (res.ok) {
          const data = await res.json();
          if (data.online) {
            setLivePlayers(data.players);
            if (data.maxPlayers > 0) setLiveMaxPlayers(data.maxPlayers);
            setLiveStatus('online');
            if (data.latencyMs) setLatency(data.latencyMs);
          } else {
            setLiveStatus('offline');
          }
        }
      } catch {}
    }, 45000);

    return () => clearInterval(interval);
  }, [server.cfx_code, server.ip, server.port, server.platform]);

  const playerPercentage = Math.min(100, Math.round((livePlayers / (liveMaxPlayers || 1)) * 100));

  const connectUrl = server.cfx_code
    ? `https://cfx.re/join/${server.cfx_code}`
    : (server.ip.startsWith('cfx.re') ? `https://${server.ip}` : `fivem://connect/${server.ip}:${server.port}`);

  const handleCopyIp = () => {
    const textToCopy = server.cfx_code
      ? `https://cfx.re/join/${server.cfx_code}`
      : `${server.ip}:${server.port}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    showCopyToast(server.cfx_code ? 'Cfx.re connect link copied!' : 'Server address copied to clipboard!');
  };

  const countryCode = getCountryCode(server.country);

  return (
    <>
      {/* Server Hero Showcase Card */}
      <section className="server-hero-card">
        <div className="server-hero-top">
          {/* Large Animated Banner Showcase — only shown if a banner was uploaded */}
          {server.banner_url && (
            <div className="server-hero-banner-wrap">
              <img
                src={server.banner_url}
                alt={`${server.name} Banner`}
                id="server-hero-banner"
                className="server-hero-banner"
              />
            </div>
          )}

          <div className="server-hero-header">
            <div className="server-identity-lockup">
              <div className="server-hero-avatar">
                <img
                  src={server.logo_url || '/assets/servers/server_1.png'}
                  alt={server.name}
                  width="72"
                  height="72"
                  className="server-avatar-img"
                  id="server-page-avatar"
                />
              </div>

              <div className="server-hero-meta">
                <div className="server-title-row">
                  <h1 className="server-hero-name" id="server-page-title">{server.name}</h1>
                  {server.is_verified && (
                    <span className="badge-verified" title="Official & Verified GTA Server" aria-label="Verified Server">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      VERIFIED
                    </span>
                  )}
                  {server.cfx_code && (
                    <span className="cfx-optional-badge" title="Direct Cfx.re Connect Enabled">
                      CFX: {server.cfx_code}
                    </span>
                  )}
                </div>
                <p className="server-hero-subtitle" id="server-page-subtitle">
                  {server.description}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="server-hero-actions">
              <a
                href={connectUrl}
                target={connectUrl.startsWith('http') ? '_blank' : undefined}
                rel={connectUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="btn-hero-action btn-hero-connect"
                id="btn-connect-direct"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>CONNECT</span>
              </a>
              <button
                type="button"
                className="btn-hero-action btn-hero-copy"
                id="btn-copy-ip"
                onClick={handleCopyIp}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>{server.cfx_code ? 'COPY CFX LINK' : 'COPY IP'}</span>
              </button>
              {server.discord_url && (
                <a
                  href={server.discord_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-hero-action btn-hero-discord"
                  id="btn-discord"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <span>DISCORD</span>
                </a>
              )}
              {server.website_url && (
                <a
                  href={server.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-hero-action btn-hero-website"
                  id="btn-website"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <span>WEBSITE</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Live Server Metrics Bar */}
        <div className="server-live-bar">
          <div className="live-metric-item">
            <span className={`live-status-dot ${liveStatus === 'offline' ? 'offline' : ''}`}></span>
            <div className="metric-text-wrap">
              <span className="metric-label">STATUS</span>
              <span className={`metric-value ${liveStatus === 'online' ? 'status-online' : 'status-offline'}`}>
                {liveStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="live-metric-item metric-players">
            <div className="metric-text-wrap">
              <span className="metric-label">ONLINE PLAYERS</span>
              <span className="metric-value" id="stat-players-count">
                {livePlayers} / {liveMaxPlayers}
              </span>
              <div className="live-player-track">
                <div
                  className="live-player-fill"
                  id="stat-players-bar"
                  style={{ width: `${playerPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="live-metric-item">
            <div className="metric-text-wrap">
              <span className="metric-label">LATENCY</span>
              <span className="metric-value" id="stat-ping">~{latency}ms</span>
            </div>
          </div>

          <div className="live-metric-item">
            <div className="metric-text-wrap">
              <span className="metric-label">LOCATION</span>
              <div className="metric-value region-inline" id="stat-region" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CountryFlag country={server.country} width={16} height={12} className="region-flag-mini" />
                <span>{server.country} ({countryCode})</span>
              </div>
            </div>
          </div>

          <div className="live-metric-item">
            <div className="metric-text-wrap">
              <span className="metric-label">UPTIME</span>
              <span className="metric-value stat-uptime-val" id="stat-uptime">
                {server.uptime_percentage}%
              </span>
            </div>
          </div>

          <div className="live-metric-item">
            <div className="metric-text-wrap">
              <span className="metric-label">BUILD</span>
              <span className="metric-value" id="stat-version">
                {server.platform} {server.game_version}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Copy Toast Notification */}
      <div className="copy-toast" id="copy-toast">
        Copied to clipboard!
      </div>
    </>
  );
}
