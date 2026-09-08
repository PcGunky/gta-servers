import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      padding: '100px 20px',
      textAlign: 'center',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        fontFamily: 'var(--font-gta)',
        fontSize: '72px',
        color: 'var(--accent-pink)',
        lineHeight: '1.0',
        letterSpacing: '2px'
      }}>
        404
      </div>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 800,
        color: 'var(--text-white)',
        marginTop: '16px'
      }}>
        SERVER OR PAGE NOT FOUND
      </h1>
      <p style={{
        color: 'var(--text-muted)',
        maxWidth: '480px',
        margin: '12px auto 24px auto',
        fontSize: '13.5px',
        lineHeight: '1.6'
      }}>
        The requested GTA server listing or directory page might have been removed, renamed, or is temporarily offline.
      </p>
      <Link
        href="/"
        className="btn-filter-reset"
        style={{
          padding: '10px 24px',
          fontSize: '13px',
          textDecoration: 'none',
          backgroundColor: 'var(--accent-pink)',
          color: '#ffffff',
          fontWeight: 700,
          borderRadius: '8px'
        }}
      >
        BACK TO SERVERS DIRECTORY
      </Link>
    </div>
  );
}
