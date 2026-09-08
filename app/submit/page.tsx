import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SubmitFormClient from '@/components/SubmitFormClient';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Submit Your GTA Server — Add Server to GTA SERVERS Directory',
  description: 'Register and publish your Grand Theft Auto V or FiveM server to the GTA SERVERS directory. Get indexed, gain daily players, track real-time uptime, and grow your community.',
  alternates: {
    canonical: 'https://gtagameservers.com/submit',
  },
  openGraph: {
    title: 'Submit Your GTA Server — Add Server to Directory',
    description: 'Register and publish your Grand Theft Auto V or FiveM server to the GTA SERVERS directory. Gain players and track real-time analytics.',
    url: 'https://gtagameservers.com/submit',
  }
};

export default function SubmitPage() {
  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gtagameservers.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Submit Server',
        item: 'https://gtagameservers.com/submit'
      }
    ]
  };

  return (
    <div className="submit-page-wrapper">
      <JsonLd data={breadcrumbsSchema} />

      {/* Breadcrumbs Navigation */}
      <nav className="server-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Submit Server</span>
      </nav>

      {/* Hero Title Header */}
      <div className="submit-header-section">
        <div className="hero-title-wrap">
          <h1 className="hero-title">ADD YOUR GTA SERVER</h1>
          <div className="title-underline-brush"></div>
        </div>
        <p className="submit-header-subtitle">
          List your FiveM or GTA community to gain players, rank on organic search, and track 24/7 uptime monitoring.
        </p>
      </div>

      {/* Interactive Client Form */}
      <SubmitFormClient />
    </div>
  );
}
