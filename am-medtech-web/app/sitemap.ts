import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://ammedtech.com';

    const routes = [
        '',
        '/about',
        '/data-intelligence',
        '/solutions/dms-platform',
        '/solutions/rtm-strategy',
        '/solutions/distribution-development',
        '/solutions/pharma-ecommerce',
        '/case-studies',
        '/case-studies/famfa',
        '/careers',
        '/contact',
        '/login',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));
}
