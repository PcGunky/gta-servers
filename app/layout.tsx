import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || 'https://gtagameservers.com'),
  title: {
    default: 'GTA SERVERS — All GTA 5 & FiveM Game Servers',
    template: '%s — GTA SERVERS'
  },
  description: 'Explore the complete directory of GTA 5, GTA 6, and FiveM multiplayer servers. Live player counts, uptime tracking, server rankings, and direct connect.',
  keywords: ['GTA servers', 'GTA 5 servers', 'FiveM servers', 'GTA RP servers', 'GTA roleplay servers', 'FiveM server list', 'German GTA servers', 'best GTA servers'],
  authors: [{ name: 'GTA Servers Directory' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gtagameservers.com',
    siteName: 'GTA Game Servers',
    title: 'GTA SERVERS — Grand Theft Auto V & FiveM Directory',
    description: 'Find, rank, and join top GTA 5 & FiveM servers worldwide with real-time status and player stats.',
    images: [
      {
        url: '/assets/herote.png',
        width: 1920,
        height: 1080,
        alt: 'GTA Servers Directory Header Banner'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTA SERVERS — GTA 5 & FiveM Server Rankings',
    description: 'Explore top FiveM and GTA roleplay servers with live tracking.',
    images: ['/assets/herote.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.jpg', type: 'image/jpeg' },
      { url: '/favicon.ico' },
      { url: 'https://scldnatvywnrosryqzbz.supabase.co/storage/v1/object/public/GTA%20Serverlist/gta_server_list.jpg', type: 'image/jpeg' }
    ],
    shortcut: ['/favicon.jpg'],
    apple: [
      { url: '/favicon.jpg' }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: '#0e0f12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href="/favicon.jpg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/assets/fonts.css" />
      </head>
      <body>
        <div className="page-wrapper">
          {/* Hero background with dusk skyline & steeper black silhouette ramp */}
          <div className="hero-background" id="hero-bg">
            <div className="hero-silhouette-divider">
              <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="hero-dropoff-svg">
                <path d="M 0,80 L 0,8 L 560,8 L 640,48 L 1440,48 L 1440,80 Z" fill="#0e0f12" />
                <path d="M 0,8 L 560,8 L 640,48 L 1440,48" fill="none" stroke="#000000" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          <main className="main-content">
            <Header />
            {children}
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
