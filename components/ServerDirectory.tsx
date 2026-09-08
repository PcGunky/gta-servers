'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ServerEntity } from '@/lib/types';
import ServerCard from './ServerCard';
import { getCountryCode } from './CountryFlag';

interface ServerDirectoryProps {
  initialServers: ServerEntity[];
  categoryTitle?: string;
  categorySubtitle?: string;
  currentCategorySlug?: string;
  categoryCounts?: {
    all: number;
    freeroam: number;
    roleplay: number;
    dm: number;
    racing: number;
    stuntracing: number;
    other: number;
  };
}

export default function ServerDirectory({
  initialServers,
  categoryTitle = 'ALL GTA V SERVERS',
  currentCategorySlug = 'all',
  categoryCounts,
}: ServerDirectoryProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [minPlayers, setMinPlayers] = useState(0);
  const [regionFilter, setRegionFilter] = useState('all');
  const [sortOption, setSortOption] = useState('players-desc');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const toggleFeature = (feat: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setMinPlayers(0);
    setRegionFilter('all');
    setSortOption('players-desc');
    setSelectedFeatures([]);
    setCurrentPage(1);
  };

  const filteredServers = useMemo(() => {
    let list = [...initialServers];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Min players
    if (minPlayers > 0) {
      list = list.filter(s => s.current_players >= minPlayers);
    }

    // Region / Country Filter
    if (regionFilter && regionFilter !== 'all') {
      const rf = regionFilter.toLowerCase();
      list = list.filter(s => {
        const countryLower = (s.country || '').toLowerCase();
        const regionLower = (s.region || '').toLowerCase();
        const code = getCountryCode(s.country).toLowerCase();

        if (rf === 'eu') {
          return regionLower.includes('europe') || ['germany', 'france', 'austria', 'switzerland', 'united kingdom', 'spain', 'italy', 'netherlands', 'poland', 'sweden'].some(c => countryLower.includes(c));
        }
        if (rf === 'us' || rf === 'usa') {
          return countryLower.includes('united states') || countryLower.includes('usa') || code === 'us';
        }
        if (rf === 'de') {
          return countryLower.includes('germany') || code === 'de';
        }
        if (rf === 'gb' || rf === 'uk') {
          return countryLower.includes('united kingdom') || countryLower.includes('britain') || code === 'gb';
        }
        if (rf === 'fr') {
          return countryLower.includes('france') || code === 'fr';
        }
        if (rf === 'ar' || rf === 'arabia') {
          return countryLower.includes('arab') || countryLower.includes('saudi') || code === 'ar';
        }
        if (rf === 'at') {
          return countryLower.includes('austria') || code === 'at';
        }
        if (rf === 'ch') {
          return countryLower.includes('switzerland') || code === 'ch';
        }
        if (rf === 'ca') {
          return countryLower.includes('canada') || code === 'ca';
        }
        if (rf === 'tr') {
          return countryLower.includes('turkey') || countryLower.includes('türkiye') || code === 'tr';
        }
        if (rf === 'br') {
          return countryLower.includes('brazil') || countryLower.includes('brasil') || code === 'br';
        }
        if (rf === 'es') {
          return countryLower.includes('spain') || countryLower.includes('españa') || code === 'es';
        }
        if (rf === 'it') {
          return countryLower.includes('italy') || countryLower.includes('italia') || code === 'it';
        }
        if (rf === 'nl') {
          return countryLower.includes('netherlands') || countryLower.includes('holland') || code === 'nl';
        }
        if (rf === 'pl') {
          return countryLower.includes('poland') || countryLower.includes('polska') || code === 'pl';
        }
        if (rf === 'ru') {
          return countryLower.includes('russia') || code === 'ru';
        }
        if (rf === 'au') {
          return countryLower.includes('australia') || code === 'au';
        }
        if (rf === 'se') {
          return countryLower.includes('sweden') || code === 'se';
        }
        if (rf === 'intl') {
          return countryLower.includes('international') || regionLower.includes('global');
        }

        return countryLower.includes(rf) || regionLower.includes(rf) || code === rf;
      });
    }

    // Features
    if (selectedFeatures.length > 0) {
      list = list.filter(s => {
        const serverTags = s.tags.map(t => t.toLowerCase());
        const desc = s.description.toLowerCase();
        return selectedFeatures.every(f => 
          serverTags.some(t => t.includes(f)) || desc.includes(f)
        );
      });
    }

    // Sort
    if (sortOption === 'players-desc') {
      list.sort((a, b) => b.current_players - a.current_players);
    } else if (sortOption === 'players-asc') {
      list.sort((a, b) => a.current_players - b.current_players);
    } else if (sortOption === 'rank') {
      list.sort((a, b) => (a.rank || 99) - (b.rank || 99));
    }

    return list;
  }, [initialServers, searchQuery, minPlayers, regionFilter, sortOption, selectedFeatures]);

  const totalPlayers = useMemo(() => {
    return initialServers.reduce((acc, s) => acc + s.current_players, 0);
  }, [initialServers]);

  const totalPages = Math.ceil(filteredServers.length / pageSize) || 1;
  const displayedServers = filteredServers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const categories = useMemo(() => {
    if (categoryCounts) {
      return [
        { slug: 'all', href: '/', name: 'All Servers', count: categoryCounts.all },
        { slug: 'freeroam', href: '/gta-5-servers/freeroam', name: 'Freeroam', count: categoryCounts.freeroam },
        { slug: 'roleplay', href: '/gta-5-servers/roleplay', name: 'Roleplay', count: categoryCounts.roleplay },
        { slug: 'dm', href: '/gta-5-servers/pvp', name: 'DM / PvP', count: categoryCounts.dm },
        { slug: 'racing', href: '/gta-5-servers/racing', name: 'Racing', count: categoryCounts.racing },
        { slug: 'stuntracing', href: '/gta-5-servers/stuntracing', name: 'Stunt Racing', count: categoryCounts.stuntracing },
        { slug: 'other', href: '/gta-5-servers/other', name: 'Other', count: categoryCounts.other },
      ];
    }

    const total = initialServers.length;
    const roleplayCount = initialServers.filter(s => s.server_type.toLowerCase().includes('roleplay') || s.game_mode.toLowerCase().includes('rp')).length;
    const freeroamCount = initialServers.filter(s => s.server_type.toLowerCase().includes('freeroam') || s.game_mode.toLowerCase().includes('freeroam')).length;
    const dmCount = initialServers.filter(s => s.server_type.toLowerCase().includes('pvp') || s.game_mode.toLowerCase().includes('pvp') || s.game_mode.toLowerCase().includes('dm')).length;
    const racingCount = initialServers.filter(s => s.server_type.toLowerCase().includes('racing') || s.game_mode.toLowerCase().includes('race')).length;
    const stuntCount = initialServers.filter(s => s.game_mode.toLowerCase().includes('stunt') || s.tags.some(t => t.toLowerCase().includes('stunt'))).length;
    const otherCount = initialServers.filter(s => s.tags.includes('Mini Games') || s.game_mode.includes('Semi-Serious') || s.server_type.toLowerCase().includes('other')).length;

    return [
      { slug: 'all', href: '/', name: 'All Servers', count: total },
      { slug: 'freeroam', href: '/gta-5-servers/freeroam', name: 'Freeroam', count: freeroamCount },
      { slug: 'roleplay', href: '/gta-5-servers/roleplay', name: 'Roleplay', count: roleplayCount },
      { slug: 'dm', href: '/gta-5-servers/pvp', name: 'DM / PvP', count: dmCount },
      { slug: 'racing', href: '/gta-5-servers/racing', name: 'Racing', count: racingCount },
      { slug: 'stuntracing', href: '/gta-5-servers/stuntracing', name: 'Stunt Racing', count: stuntCount },
      { slug: 'other', href: '/gta-5-servers/other', name: 'Other', count: otherCount },
    ];
  }, [initialServers, categoryCounts]);

  const features = [
    { id: 'voice', label: 'Voice Chat', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    )},
    { id: 'cars', label: 'Custom Cars', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"></path>
        <circle cx="7" cy="17" r="2"></circle>
        <path d="M9 17h6"></path>
        <circle cx="17" cy="17" r="2"></circle>
      </svg>
    )},
    { id: 'whitelist', label: 'Whitelist', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    )},
    { id: 'economy', label: 'Economy System', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6"></circle>
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path>
        <path d="M7 6h2v4H7z"></path>
      </svg>
    )},
    { id: 'scripts', label: 'Custom Scripts', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    )},
    { id: 'admins', label: 'Active Admins', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )},
    { id: 'serious', label: 'Serious RP', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 10s3-3 8-3 8 3 8 3-3 10-8 10-8-10-8-10z"></path>
        <circle cx="7" cy="9" r="1"></circle>
        <circle cx="13" cy="9" r="1"></circle>
        <path d="M8 13c1 1 3 1 4 0"></path>
      </svg>
    )},
  ];

  return (
    <div className="content-grid">
      {/* Left Sidebar: Categories & Filters */}
      <aside className="sidebar">
        {/* Category Panel */}
        <div className="sidebar-panel">
          <div className="panel-header">CATEGORIES</div>
          <div className="category-list" id="category-list">
            {categories.map(cat => {
              const isActive = (cat.slug === 'all' && (pathname === '/' || pathname === '/gta-5-servers')) ||
                pathname === cat.href || currentCategorySlug === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={cat.href}
                  className={`category-item ${isActive ? 'active' : ''}`}
                  id={`cat-${cat.slug}`}
                >
                  <span>{cat.name}</span>
                  <span className="category-badge">{cat.count}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Filter Panel */}
        <div className="sidebar-panel">
          <div className="panel-header">FILTERS</div>

          <input
            type="text"
            className="filter-search-input"
            id="sidebar-search"
            placeholder="Search by name or tag..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />

          {/* Players Slider */}
          <div className="filter-sub-label">PLAYERS</div>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={minPlayers}
              className="custom-range-slider"
              id="player-slider"
              onChange={(e) => { setMinPlayers(Number(e.target.value)); setCurrentPage(1); }}
            />
            <div className="slider-range-labels">
              <span>{minPlayers === 0 ? '0' : minPlayers}</span>
              <span>1000+</span>
            </div>
          </div>

          {/* Region Dropdown */}
          <div className="filter-sub-label">REGION</div>
          <div className="filter-dropdown-wrap">
            <select
              className="custom-select-box"
              id="select-region"
              value={regionFilter}
              onChange={(e) => { setRegionFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Regions & Countries</option>
              <option value="de">Germany (DE)</option>
              <option value="us">United States (US)</option>
              <option value="gb">United Kingdom (GB)</option>
              <option value="fr">France (FR)</option>
              <option value="ar">Arabia / Saudi Arabia (AR)</option>
              <option value="eu">Europe (EU)</option>
              <option value="at">Austria (AT)</option>
              <option value="ch">Switzerland (CH)</option>
              <option value="ca">Canada (CA)</option>
              <option value="tr">Turkey (TR)</option>
              <option value="br">Brazil (BR)</option>
              <option value="es">Spain (ES)</option>
              <option value="it">Italy (IT)</option>
              <option value="nl">Netherlands (NL)</option>
              <option value="pl">Poland (PL)</option>
              <option value="ru">Russia (RU)</option>
              <option value="au">Australia (AU)</option>
              <option value="se">Sweden (SE)</option>
              <option value="intl">International</option>
            </select>
            <span className="dropdown-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="filter-sub-label">SORT BY</div>
          <div className="filter-dropdown-wrap">
            <select
              className="custom-select-box"
              id="select-sort"
              value={sortOption}
              onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
            >
              <option value="players-desc">Players (High to Low)</option>
              <option value="players-asc">Players (Low to High)</option>
              <option value="rank">Rank</option>
            </select>
            <span className="dropdown-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>

          {/* Features Checkboxes */}
          <div className="filter-sub-label">FEATURES</div>
          <div className="features-list" id="features-list">
            {features.map(f => (
              <label key={f.id} className="feature-checkbox-label" id={`feat-${f.id}`}>
                <input
                  type="checkbox"
                  className="feature-checkbox-input"
                  checked={selectedFeatures.includes(f.id)}
                  onChange={() => toggleFeature(f.id)}
                />
                <span className="custom-checkbox-box"></span>
                <span className="feature-icon">{f.icon}</span>
                <span>{f.label}</span>
              </label>
            ))}
          </div>

          {/* Reset Filter Button */}
          <button
            type="button"
            className="btn-reset-filters"
            id="btn-reset-filters"
            onClick={handleReset}
          >
            RESET FILTERS
          </button>
        </div>
      </aside>

      {/* Main Server Directory Column */}
      <section className="server-main-col">
        {/* Server Column Header */}
        <div className="server-column-header">
          <div className="hero-title-wrap">
            <h1 className="hero-title">{categoryTitle}</h1>
            <div className="title-underline-brush"></div>
          </div>
          <div className="online-stat" id="online-stat">
            Players online: <span className="stat-number">{totalPlayers}</span>
          </div>
        </div>

        {/* Table Header */}
        <div className="server-table-header">
          <div className="col-rank">#</div>
          <div className="col-server">SERVER</div>
          <div className="col-players">PLAYERS</div>
          <div className="col-region">REGION</div>
          <div className="col-conn">CONNECTION</div>
        </div>

        {/* Server List */}
        <div className="server-list-container" id="server-list">
          {displayedServers.length > 0 ? (
            displayedServers.map((server, idx) => (
              <ServerCard
                key={server.id}
                server={server}
                rank={(currentPage - 1) * pageSize + idx + 1}
              />
            ))
          ) : (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: '#13151b',
              border: '1px dashed #262a36',
              borderRadius: '8px',
              color: '#94a3b8'
            }}>
              {initialServers.length === 0 ? (
                <div>
                  <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '16px', fontWeight: 700 }}>NO SERVERS REGISTERED YET</h4>
                  <p style={{ marginBottom: '16px', fontSize: '13px', color: '#94a3b8' }}>Your database is currently empty. List your first GTA V or FiveM server now!</p>
                  <a href="/submit" className="btn-hero-action btn-hero-connect" style={{ display: 'inline-flex', padding: '9px 20px', textDecoration: 'none' }}>
                    + SUBMIT A SERVER
                  </a>
                </div>
              ) : (
                'No servers match the selected filters. Click "RESET FILTERS" to view all servers.'
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="pagination-container" aria-label="Pagination">
            <button
              type="button"
              className="page-btn"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="page-btn"
              aria-label="Next page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              &gt;
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
