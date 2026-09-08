'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/lib/seed';

interface CategoryNavProps {
  currentCategory?: string;
}

export default function CategoryNav({ currentCategory = 'all' }: CategoryNavProps) {
  const pathname = usePathname();

  const getHref = (slug: string) => {
    if (slug === 'all') return '/';
    return `/gta-5-servers/${slug}`;
  };

  const isActive = (slug: string) => {
    if (slug === 'all') {
      return pathname === '/' || pathname === '/gta-5-servers';
    }
    return pathname === `/gta-5-servers/${slug}` || currentCategory === slug;
  };

  return (
    <nav className="category-tabs-bar" id="category-tabs" aria-label="Server Categories">
      {CATEGORIES.map((cat) => {
        const active = isActive(cat.slug);
        return (
          <Link
            key={cat.id}
            href={getHref(cat.slug)}
            className={`category-tab-btn ${active ? 'active' : ''}`}
            data-category={cat.slug}
          >
            <span className="cat-label">{cat.name}</span>
            <span className="cat-count">{cat.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
