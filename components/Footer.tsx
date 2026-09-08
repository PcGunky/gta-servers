'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer" style={{
      marginTop: '60px',
      borderTop: '1px solid var(--card-border)',
      padding: '40px 0 20px 0',
      color: 'var(--text-muted)',
      fontSize: '13px'
    }}>
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '0 28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        <div>
          <div style={{ marginBottom: '16px', lineHeight: 0 }}>
            <Link href="/" className="logo-box" aria-label="GTA SERVERS Home" style={{ display: 'inline-block' }}>
              <img
                src="https://vyituhexijiwvalgdabj.supabase.co/storage/v1/object/public/Kratn_tuebingen/gta_server_list.png"
                alt="GTA SERVERS"
                className="site-logo-img footer-logo-img"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/assets/gta_server_list.png';
                }}
              />
            </Link>
          </div>
          <p style={{ lineHeight: '1.6', fontSize: '12.5px', color: 'var(--text-dim)', margin: 0 }}>
            The go-to directory for GTA V and FiveM servers. Browse top roleplay communities, check live player counts, and jump in instantly.
          </p>
        </div>

        <div>
          <h3 style={{ color: 'var(--text-white)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.8px', margin: '0 0 14px 0', lineHeight: '1.2' }}>
            SERVER CATEGORIES
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2.0', fontSize: '12.5px' }}>
            <li><Link href="/gta-5-servers/roleplay" style={{ color: 'var(--text-muted)' }}>Roleplay Servers</Link></li>
            <li><Link href="/gta-5-servers/freeroam" style={{ color: 'var(--text-muted)' }}>Freeroam Servers</Link></li>
            <li><Link href="/gta-5-servers/racing" style={{ color: 'var(--text-muted)' }}>Racing & Stunts</Link></li>
            <li><Link href="/gta-5-servers/pvp" style={{ color: 'var(--text-muted)' }}>PvP & Gang Wars</Link></li>
          </ul>
        </div>

        <div>
          <h3 style={{ color: 'var(--text-white)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.8px', margin: '0 0 14px 0', lineHeight: '1.2' }}>
            REGIONS & LANGUAGES
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2.0', fontSize: '12.5px' }}>
            <li><Link href="/gta-5-servers/germany" style={{ color: 'var(--text-muted)' }}>German GTA Servers</Link></li>
            <li><Link href="/gta-5-servers/english" style={{ color: 'var(--text-muted)' }}>English GTA Servers</Link></li>
            <li><Link href="/gta-5-servers/usa" style={{ color: 'var(--text-muted)' }}>United States Servers</Link></li>
            <li><Link href="/gta-5-servers/europe" style={{ color: 'var(--text-muted)' }}>European Servers</Link></li>
          </ul>
        </div>

        <div>
          <h3 style={{ color: 'var(--text-white)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.8px', margin: '0 0 14px 0', lineHeight: '1.2' }}>
            COMMUNITY & LEGAL
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2.0', fontSize: '12.5px' }}>
            <li><Link href="/fivem-servers" style={{ color: 'var(--text-muted)' }}>FiveM Hub</Link></li>
            <li><a href="https://discord.gg/VxmABVb9qk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>Discord Community</a></li>
            <li><span style={{ color: 'var(--text-dim)' }}>API & Uptime Status</span></li>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1380px',
        margin: '30px auto 0 auto',
        padding: '20px 28px 0 28px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        fontSize: '11.5px',
        color: 'var(--text-dim)'
      }}>
        <div>
          © {new Date().getFullYear()} GTA SERVERS. All rights reserved.
        </div>
        <div>
          Not affiliated with Rockstar Games, Take-Two Interactive, or Cfx.re. GTA V is a registered trademark of Rockstar Games.
        </div>
      </div>
    </footer>
  );
}
