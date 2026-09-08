import { MetadataRoute } from 'next';
import { getAllServers } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || 'https://gtagameservers.com';
  const servers = await getAllServers();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gta-5-servers`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fivem-servers`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gta-5-servers/roleplay`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gta-5-servers/freeroam`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gta-5-servers/pvp`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gta-5-servers/germany`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gta-5-servers/english`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gta-5-servers/usa`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gta-5-servers/europe`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gta-5-servers/best`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.85,
    },
  ];

  const serverRoutes: MetadataRoute.Sitemap = servers.map((s) => ({
    url: `${baseUrl}/server/${s.slug}`,
    lastModified: new Date(s.updated_at || s.created_at),
    changeFrequency: 'hourly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...serverRoutes];
}
