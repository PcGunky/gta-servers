'use client';

import React from 'react';

interface CountryFlagProps {
  country?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function getCountryCode(country?: string): string {
  if (!country) return 'GLOBAL';
  const c = country.toLowerCase().trim();
  if (c.includes('united states') || c === 'usa' || c === 'us' || c.includes('america')) return 'US';
  if (c.includes('germany') || c === 'de' || c.includes('deutschland')) return 'DE';
  if (c.includes('united kingdom') || c === 'uk' || c === 'gb' || c.includes('britain') || c.includes('england')) return 'GB';
  if (c.includes('france') || c === 'fr') return 'FR';
  if (c.includes('canada') || c === 'ca') return 'CA';
  if (c.includes('turkey') || c === 'tr' || c.includes('türkiye')) return 'TR';
  if (c.includes('brazil') || c === 'br' || c.includes('brasil')) return 'BR';
  if (c.includes('spain') || c === 'es' || c.includes('españa')) return 'ES';
  if (c.includes('italy') || c === 'it' || c.includes('italia')) return 'IT';
  if (c.includes('netherlands') || c === 'nl' || c.includes('holland')) return 'NL';
  if (c.includes('poland') || c === 'pl' || c.includes('polska')) return 'PL';
  if (c.includes('russia') || c === 'ru') return 'RU';
  if (c.includes('australia') || c === 'au') return 'AU';
  if (c.includes('sweden') || c === 'se') return 'SE';
  if (c.includes('austria') || c === 'at') return 'AT';
  if (c.includes('switzerland') || c === 'ch') return 'CH';
  if (c.includes('europe') || c === 'eu') return 'EU';
  if (c.includes('arab') || c.includes('saudi') || c === 'sa' || c.includes('uae') || c === 'ae' || c.includes('emirates') || c.includes('dubai') || c.includes('qatar') || c.includes('kuwait') || c.includes('mena')) return 'AR';
  return 'GLOBAL';
}

export default function CountryFlag({
  country,
  className = 'region-flag',
  width = 640,
  height = 480
}: CountryFlagProps) {
  const code = getCountryCode(country);

  switch (code) {
    case 'US':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'United States'}>
          {/* US 13 stripes */}
          <rect width="640" height="480" fill="#b22234" />
          <rect y="36.9" width="640" height="36.9" fill="#ffffff" />
          <rect y="110.8" width="640" height="36.9" fill="#ffffff" />
          <rect y="184.6" width="640" height="36.9" fill="#ffffff" />
          <rect y="258.5" width="640" height="36.9" fill="#ffffff" />
          <rect y="332.3" width="640" height="36.9" fill="#ffffff" />
          <rect y="406.2" width="640" height="36.9" fill="#ffffff" />
          {/* Blue canton */}
          <rect width="256" height="258.5" fill="#3c3b6e" />
          {/* Mini stars pattern */}
          <g fill="#ffffff">
            <circle cx="36" cy="30" r="8" />
            <circle cx="92" cy="30" r="8" />
            <circle cx="148" cy="30" r="8" />
            <circle cx="204" cy="30" r="8" />
            <circle cx="64" cy="65" r="8" />
            <circle cx="120" cy="65" r="8" />
            <circle cx="176" cy="65" r="8" />
            <circle cx="36" cy="100" r="8" />
            <circle cx="92" cy="100" r="8" />
            <circle cx="148" cy="100" r="8" />
            <circle cx="204" cy="100" r="8" />
            <circle cx="64" cy="135" r="8" />
            <circle cx="120" cy="135" r="8" />
            <circle cx="176" cy="135" r="8" />
            <circle cx="36" cy="170" r="8" />
            <circle cx="92" cy="170" r="8" />
            <circle cx="148" cy="170" r="8" />
            <circle cx="204" cy="170" r="8" />
            <circle cx="64" cy="205" r="8" />
            <circle cx="120" cy="205" r="8" />
            <circle cx="176" cy="205" r="8" />
            <circle cx="36" cy="235" r="8" />
            <circle cx="92" cy="235" r="8" />
            <circle cx="148" cy="235" r="8" />
            <circle cx="204" cy="235" r="8" />
          </g>
        </svg>
      );

    case 'DE':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Germany'}>
          <rect width="640" height="160" fill="#000000" />
          <rect y="160" width="640" height="160" fill="#dd0000" />
          <rect y="320" width="640" height="160" fill="#ffce00" />
        </svg>
      );

    case 'GB':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'United Kingdom'}>
          <rect width="640" height="480" fill="#012169" />
          {/* White diagonal saltire */}
          <path d="M0,0 L640,480 M640,0 L0,480" stroke="#ffffff" strokeWidth="60" />
          {/* Red diagonal saltire */}
          <path d="M0,0 L640,480 M640,0 L0,480" stroke="#c8102e" strokeWidth="24" />
          {/* White cross */}
          <path d="M320,0 L320,480 M0,240 L640,240" stroke="#ffffff" strokeWidth="100" />
          {/* Red cross */}
          <path d="M320,0 L320,480 M0,240 L640,240" stroke="#c8102e" strokeWidth="60" />
        </svg>
      );

    case 'FR':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'France'}>
          <rect width="213.3" height="480" fill="#002395" />
          <rect x="213.3" width="213.3" height="480" fill="#ffffff" />
          <rect x="426.6" width="213.4" height="480" fill="#ed2939" />
        </svg>
      );

    case 'CA':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Canada'}>
          <rect width="160" height="480" fill="#ff0000" />
          <rect x="160" width="320" height="480" fill="#ffffff" />
          <rect x="480" width="160" height="480" fill="#ff0000" />
          {/* Stylized Maple leaf */}
          <path
            d="M320,120 L335,185 L390,170 L360,215 L400,240 L350,265 L360,310 L330,290 L324,350 L316,350 L310,290 L280,310 L290,265 L240,240 L280,215 L250,170 L305,185 Z"
            fill="#ff0000"
          />
        </svg>
      );

    case 'TR':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Turkey'}>
          <rect width="640" height="480" fill="#e30a17" />
          {/* Crescent */}
          <circle cx="280" cy="240" r="120" fill="#ffffff" />
          <circle cx="310" cy="240" r="96" fill="#e30a17" />
          {/* Star */}
          <polygon
            points="380,240 405,248 395,224 415,206 388,206 380,180 372,206 345,206 365,224 355,248"
            fill="#ffffff"
            transform="rotate(18 380 240)"
          />
        </svg>
      );

    case 'BR':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Brazil'}>
          <rect width="640" height="480" fill="#009c3b" />
          {/* Yellow rhombus */}
          <polygon points="320,45 595,240 320,435 45,240" fill="#ffdf00" />
          {/* Blue circle */}
          <circle cx="320" cy="240" r="105" fill="#002776" />
          {/* White curve banner */}
          <path d="M225,250 Q320,220 415,255" stroke="#ffffff" strokeWidth="18" fill="none" />
        </svg>
      );

    case 'ES':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Spain'}>
          <rect width="640" height="120" fill="#aa151b" />
          <rect y="120" width="640" height="240" fill="#f1bf00" />
          <rect y="360" width="640" height="120" fill="#aa151b" />
          {/* Simplified crest */}
          <circle cx="180" cy="240" r="32" fill="#aa151b" />
        </svg>
      );

    case 'IT':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Italy'}>
          <rect width="213.3" height="480" fill="#009246" />
          <rect x="213.3" width="213.3" height="480" fill="#ffffff" />
          <rect x="426.6" width="213.4" height="480" fill="#ce2b37" />
        </svg>
      );

    case 'NL':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Netherlands'}>
          <rect width="640" height="160" fill="#ae1c28" />
          <rect y="160" width="640" height="160" fill="#ffffff" />
          <rect y="320" width="640" height="160" fill="#21468b" />
        </svg>
      );

    case 'PL':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Poland'}>
          <rect width="640" height="240" fill="#ffffff" />
          <rect y="240" width="640" height="240" fill="#dc143c" />
        </svg>
      );

    case 'RU':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Russia'}>
          <rect width="640" height="160" fill="#ffffff" />
          <rect y="160" width="640" height="160" fill="#0039a6" />
          <rect y="320" width="640" height="160" fill="#d52b1e" />
        </svg>
      );

    case 'AU':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Australia'}>
          <rect width="640" height="480" fill="#00008b" />
          {/* Canton Union Jack mini */}
          <rect width="280" height="210" fill="#012169" />
          <path d="M0,0 L280,210 M280,0 L0,210" stroke="#ffffff" strokeWidth="26" />
          <path d="M0,0 L280,210 M280,0 L0,210" stroke="#c8102e" strokeWidth="12" />
          <path d="M140,0 L140,210 M0,105 L280,105" stroke="#ffffff" strokeWidth="44" />
          <path d="M140,0 L140,210 M0,105 L280,105" stroke="#c8102e" strokeWidth="26" />
          {/* Commonwealth Star */}
          <circle cx="140" cy="340" r="28" fill="#ffffff" />
          {/* Southern Cross stars */}
          <circle cx="480" cy="110" r="10" fill="#ffffff" />
          <circle cx="540" cy="200" r="10" fill="#ffffff" />
          <circle cx="440" cy="240" r="10" fill="#ffffff" />
          <circle cx="490" cy="380" r="14" fill="#ffffff" />
          <circle cx="510" cy="270" r="7" fill="#ffffff" />
        </svg>
      );

    case 'SE':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Sweden'}>
          <rect width="640" height="480" fill="#006aa7" />
          <rect x="180" width="80" height="480" fill="#fecc00" />
          <rect y="200" width="640" height="80" fill="#fecc00" />
        </svg>
      );

    case 'EU':
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Europe'}>
          <rect width="640" height="480" fill="#003399" />
          <g fill="#ffcc00">
            <circle cx="320" cy="90" r="12" />
            <circle cx="395" cy="110" r="12" />
            <circle cx="450" cy="165" r="12" />
            <circle cx="470" cy="240" r="12" />
            <circle cx="450" cy="315" r="12" />
            <circle cx="395" cy="370" r="12" />
            <circle cx="320" cy="390" r="12" />
            <circle cx="245" cy="370" r="12" />
            <circle cx="190" cy="315" r="12" />
            <circle cx="170" cy="240" r="12" />
            <circle cx="190" cy="165" r="12" />
            <circle cx="245" cy="110" r="12" />
          </g>
        </svg>
      );

    case 'AR':
      // Saudi Arabia / Arabic Servers Flag
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Saudi Arabia / Arab'}>
          <rect width="640" height="480" fill="#006c35" />
          <text x="320" y="225" fill="#ffffff" fontSize="64" fontWeight="700" textAnchor="middle" fontFamily="'Segoe UI', Arial, sans-serif">
            لا إله إلا الله
          </text>
          <path d="M170,305 L470,305 L460,295 L470,305 L460,315 L170,305" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
          <path d="M210,285 L210,325" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
          <circle cx="170" cy="305" r="9" fill="#ffffff" />
        </svg>
      );

    case 'AT':
      // Austria (Red - White - Red)
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Austria'}>
          <rect width="640" height="160" fill="#ed2939" />
          <rect y="160" width="640" height="160" fill="#ffffff" />
          <rect y="320" width="640" height="160" fill="#ed2939" />
        </svg>
      );

    case 'CH':
      // Switzerland (Red with White Cross)
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'Switzerland'}>
          <rect width="640" height="480" fill="#d52b1e" />
          <rect x="270" y="120" width="100" height="240" fill="#ffffff" />
          <rect x="200" y="190" width="240" height="100" fill="#ffffff" />
        </svg>
      );

    default:
      // Global / International / Generic
      return (
        <svg className={className} viewBox="0 0 640 480" width={width} height={height} aria-label={country || 'International'}>
          <rect width="640" height="480" fill="#1b2838" />
          {/* Globe wireframe */}
          <circle cx="320" cy="240" r="140" fill="none" stroke="#4a90e2" strokeWidth="16" />
          <ellipse cx="320" cy="240" rx="80" ry="140" fill="none" stroke="#4a90e2" strokeWidth="14" />
          <line x1="180" y1="240" x2="460" y2="240" stroke="#4a90e2" strokeWidth="14" />
          <line x1="200" y1="170" x2="440" y2="170" stroke="#4a90e2" strokeWidth="10" />
          <line x1="200" y1="310" x2="440" y2="310" stroke="#4a90e2" strokeWidth="10" />
        </svg>
      );
  }
}
