import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || 'https://gtagameservers.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/search', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
