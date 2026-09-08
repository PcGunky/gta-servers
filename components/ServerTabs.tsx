'use client';

import React, { useState } from 'react';
import { ServerEntity } from '@/lib/types';
import InteractiveChart from './InteractiveChart';
import { showCopyToast } from './ServerDetailClient';

interface ServerTabsProps {
  server: ServerEntity;
  onCopy?: (text: string) => void;
}

type TabType = 'overview' | 'features' | 'stats' | 'uptime' | 'join';

export default function ServerTabs({ server, onCopy }: ServerTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const connectCmd = server.cfx_code
    ? `connect cfx.re/join/${server.cfx_code}`
    : (server.ip && server.ip.startsWith('cfx.re') ? `connect ${server.ip}` : `connect ${server.ip}:${server.port}`);

  const handleCopyCmd = () => {
    if (onCopy) {
      onCopy(connectCmd);
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(connectCmd).catch(() => {});
      }
      showCopyToast('F8 Console command copied!');
    }
  };

  const defaultRules = [
    'Strict In-Character (IC) voice roleplay required at all times.',
    'Value of Life (FailRP / FearRP) rules are strictly enforced.',
    'Metagaming and stream-sniping will result in an immediate permanent ban.',
    'Vehicle Deathmatch (VDM) and Random Deathmatch (RDM) without prior IC conflict are prohibited.',
    'All criminal heists require registered gang membership or prior staff ticket.'
  ];

  const rules = server.rules && server.rules.length > 0 ? server.rules : defaultRules;

  const descText = server.long_description || server.description;
  const descParagraphs = descText.split('\n\n').filter(Boolean);

  return (
    <div className="server-tabs-wrapper">
      {/* Interactive Sub-Tabs Bar */}
      <div className="server-tabs-bar" role="tablist">
        <button
          type="button"
          className={`server-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          role="tab"
          aria-selected={activeTab === 'overview'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          <span>OVERVIEW</span>
        </button>

        <button
          type="button"
          className={`server-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
          role="tab"
          aria-selected={activeTab === 'features'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>FEATURES</span>
        </button>

        <button
          type="button"
          className={`server-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
          role="tab"
          aria-selected={activeTab === 'stats'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>PLAYER STATS & HISTORY</span>
        </button>

        <button
          type="button"
          className={`server-tab-btn ${activeTab === 'uptime' ? 'active' : ''}`}
          onClick={() => setActiveTab('uptime')}
          role="tab"
          aria-selected={activeTab === 'uptime'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>UPTIME & HEALTH</span>
        </button>

        <button
          type="button"
          className={`server-tab-btn ${activeTab === 'join' ? 'active' : ''}`}
          onClick={() => setActiveTab('join')}
          role="tab"
          aria-selected={activeTab === 'join'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>HOW TO JOIN</span>
        </button>
      </div>

      {/* Tab Panes Container */}
      <div className="server-tab-content">
        {/* Tab 1: Overview Pane */}
        <div className={`server-tab-pane ${activeTab === 'overview' ? 'active' : ''}`} id="tab-pane-overview" role="tabpanel">
          <div className="pane-section">
            <h3 className="pane-section-title">ABOUT THIS SERVER</h3>
            <div className="desc-container" id="tab-desc-content">
              {descParagraphs.length > 0 ? (
                descParagraphs.map((p, i) => (
                  <p key={i} className="desc-paragraph">{p}</p>
                ))
              ) : (
                <p className="desc-paragraph">{server.description}</p>
              )}
            </div>
          </div>

          {/* Server Rules Summary */}
          <div className="pane-section">
            <h3 className="pane-section-title">COMMUNITY RULES & GUIDELINES</h3>
            <ul className="rules-list-container" id="server-rules-list">
              {rules.map((rule, idx) => (
                <li key={idx} className="rule-item">
                  <span className="rule-index">{idx + 1}</span>
                  <span className="rule-text">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tab 2: Features Pane */}
        <div className={`server-tab-pane ${activeTab === 'features' ? 'active' : ''}`} id="tab-pane-features" role="tabpanel">
          <div className="pane-section">
            <h3 className="pane-section-title">SERVER FEATURES & HIGHLIGHTS</h3>
            <p className="pane-section-intro">Explore custom assets, exclusive roleplay systems, and mechanics implemented on this server.</p>
            <div className="features-grid-container" id="server-features-grid">
              {server.features && server.features.length > 0 ? (
                server.features.map((feat, idx) => (
                  <div key={idx} className="server-feature-card">
                    <h4 className="feature-card-title">{feat.title}</h4>
                    <p className="feature-card-desc">{feat.description}</p>
                  </div>
                ))
              ) : (
                <div className="server-feature-card">
                  <h4 className="feature-card-title">Custom Scripts & Economy</h4>
                  <p className="feature-card-desc">Engineered for seamless stability and authentic multiplayer gameplay.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab 3: Player Stats & History Pane */}
        <div className={`server-tab-pane ${activeTab === 'stats' ? 'active' : ''}`} id="tab-pane-stats" role="tabpanel">
          <div className="pane-section">
            <h3 className="pane-section-title">PLAYER ACTIVITY & TELEMETRY TIMELINE</h3>
            <p className="pane-section-intro">Authentic concurrent player telemetry monitored and recorded directly from the server gateway.</p>

            {/* SVG Graph Container */}
            <div className="player-chart-card">
              <div className="chart-legend" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="legend-indicator"></span>
                  <span>Active Online Players</span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Updated Hourly</span>
              </div>
              <div id="player-chart-container" className="chart-wrapper">
                <InteractiveChart data={server.player_history} serverName={server.name} currentPlayers={server.current_players} />
              </div>
            </div>

            {/* Stat Numbers Grid */}
            <div className="stat-boxes-grid">
              <div className="stat-box-card">
                <span className="stat-box-label">ONLINE PLAYERS</span>
                <span className="stat-box-value" id="stat-peak-today">{server.current_players}</span>
              </div>
              <div className="stat-box-card">
                <span className="stat-box-label">SERVER CAPACITY</span>
                <span className="stat-box-value" id="stat-avg-daily">{server.max_players} Slots</span>
              </div>
              <div className="stat-box-card">
                <span className="stat-box-label">CURRENT LOAD</span>
                <span className="stat-box-value" id="stat-unique-month">
                  {Math.round((server.current_players / (server.max_players || 1)) * 100)}%
                </span>
              </div>
              <div className="stat-box-card">
                <span className="stat-box-label">UPTIME RECORD</span>
                <span className="stat-box-value" id="stat-restarts">{server.uptime_percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 4: Uptime & Health Pane */}
        <div className={`server-tab-pane ${activeTab === 'uptime' ? 'active' : ''}`} id="tab-pane-uptime" role="tabpanel">
          <div className="pane-section">
            <h3 className="pane-section-title">SERVER UPTIME & HEALTH STATUS</h3>
            <p className="pane-section-intro">Continuous liveness checks performed every 60 seconds.</p>

            {/* 30-Day Calendar Bar Indicator */}
            <div className="uptime-bar-card">
              <div className="uptime-header-row">
                <span className="uptime-title">Past 30 Days Record</span>
                <span className="uptime-score">{server.uptime_percentage}% Uptime</span>
              </div>

              <div className="uptime-visual-track">
                {Array.from({ length: 29 }).map((_, i) => (
                  <div key={i} className="uptime-day-tick" title={`Day ${i + 1}: 100%`}></div>
                ))}
                <div className="uptime-day-tick active-today" title="Today: 100%"></div>
              </div>

              <div className="uptime-footer-row">
                <span>30 days ago</span>
                <span className="uptime-legend-online">● 100% Operational</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 5: How to Join Pane */}
        <div className={`server-tab-pane ${activeTab === 'join' ? 'active' : ''}`} id="tab-pane-join" role="tabpanel">
          <div className="pane-section">
            <h3 className="pane-section-title">HOW TO CONNECT TO THIS SERVER</h3>
            <p className="pane-section-intro">Follow these simple steps to join the game using FiveM.</p>

            {/* Step 1 */}
            <div className="join-step-card">
              <div className="step-badge">1</div>
              <div className="step-content">
                <h4 className="step-title">Install FiveM & GTA V</h4>
                <p className="step-desc">Ensure you have a legal copy of Grand Theft Auto V installed on Steam, Epic Games, or Rockstar Launcher, along with the latest version of the FiveM multiplayer client.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="join-step-card">
              <div className="step-badge">2</div>
              <div className="step-content">
                <h4 className="step-title">Press F8 in FiveM & Enter Connect Command</h4>
                <p className="step-desc">Launch FiveM, press the <kbd>F8</kbd> key on your keyboard to open the client developer console, then copy and paste the command below:</p>

                <div className="command-code-box">
                  <code className="code-text" id="join-cmd-display">{connectCmd}</code>
                  <button type="button" className="btn-copy-code" id="btn-copy-join-cmd" onClick={handleCopyCmd}>
                    COPY
                  </button>
                </div>
                {server.cfx_code && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <a
                      href={`https://cfx.re/join/${server.cfx_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-hero-action btn-hero-connect"
                      style={{ display: 'inline-flex', padding: '8px 16px', fontSize: '11.5px', textDecoration: 'none' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      <span>LAUNCH CFX.RE/JOIN/{server.cfx_code.toUpperCase()} (NEW TAB)</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="join-step-card">
              <div className="step-badge">3</div>
              <div className="step-content">
                <h4 className="step-title">Join Discord & Complete Whitelist</h4>
                <p className="step-desc">If this server requires a whitelist, join the server's Discord community to link your FiveM identifier and submit your character application.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
