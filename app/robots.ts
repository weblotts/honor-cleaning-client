import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/staff/', '/dashboard/', '/api/'],
      },
    ],
    sitemap: 'https://honorcleaning.com/sitemap.xml',
  };
}
