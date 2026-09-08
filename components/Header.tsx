'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="header-nav">
      {/* Logo: GTA SERVERS */}
      <Link href="/" className="logo-box" id="site-logo">
        <img
          src="https://vyituhexijiwvalgdabj.supabase.co/storage/v1/object/public/Kratn_tuebingen/gta_server_list.png"
          alt="GTA SERVERS"
          className="site-logo-img"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/assets/gta_server_list.png';
          }}
        />
      </Link>

      {/* Center Navigation Links */}
      <nav className="nav-links" id="main-nav">
        <Link 
          href="/" 
          className={`nav-item ${pathname === '/' || pathname.startsWith('/gta-5-servers') ? 'active' : ''}`}
          id="nav-servers"
        >
          SERVERS
        </Link>
        <Link 
          href="/gta-5-servers/best" 
          className={`nav-item ${pathname === '/gta-5-servers/best' ? 'active' : ''}`}
          id="nav-favoriten"
        >
          FAVORITES
        </Link>
        <Link 
          href="/submit" 
          className={`nav-item ${pathname === '/submit' ? 'active' : ''}`} 
          id="nav-submit"
        >
          SUBMIT
        </Link>
        <Link 
          href="/fivem-servers" 
          className={`nav-item ${pathname.startsWith('/fivem-servers') ? 'active' : ''}`}
          id="nav-news"
        >
          FIVEM
        </Link>
        <a 
          href="https://discord.gg/VxmABVb9qk" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="nav-item" 
          id="nav-discord"
        >
          DISCORD
        </a>
      </nav>

      {/* Header Right: Search & Submit Button */}
      <div className="header-actions">
        <form onSubmit={handleSearchSubmit} className="search-bar" role="search">
          <input
            type="text"
            id="header-search"
            placeholder="Search servers..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-icon" aria-label="Search" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
        <Link 
          href="/submit" 
          className="btn-eintragen" 
          id="btn-header-eintragen"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          SUBMIT
        </Link>
      </div>
    </header>
  );
}
