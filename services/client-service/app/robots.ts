import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/auth/signup', '/auth/login'],
            disallow: ['/dashboard/', '/api/', '/auth/'],
        },
        sitemap: 'https://bulkparser.com/sitemap.xml',
    }
}
