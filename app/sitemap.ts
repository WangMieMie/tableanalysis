import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tableanalysis.com'

  const routes = [
    '',
    '/pricing',
    '/auth/login',
    '/auth/signup',
    '/dashboard',
    '/dashboard/tables',
    '/dashboard/tables/import',
    '/dashboard/tables/new',
    '/dashboard/settings',
  ]

  const locales = ['en', 'zh']

  const urls: MetadataRoute.Sitemap = []

  // Add all localized routes
  locales.forEach(locale => {
    routes.forEach(route => {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route.includes('dashboard') ? 'daily' : 'weekly',
        priority: route === '' ? 1 : route.includes('dashboard') ? 0.8 : 0.7,
        alternates: {
          languages: {
            en: `${baseUrl}/en${route}`,
            zh: `${baseUrl}/zh${route}`,
          },
        },
      })
    })
  })

  return urls
}