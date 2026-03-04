import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/request'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tableanalysis.com'

  return {
    title: {
      default: t('title'),
      template: `%s | TableAnalysis`,
    },
    description: t('description'),
    keywords: t('keywords'),
    authors: [{ name: 'TableAnalysis' }],
    creator: 'TableAnalysis',
    publisher: 'TableAnalysis',
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'zh': '/zh',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: siteUrl,
      siteName: 'TableAnalysis',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
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
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TableAnalysis',
    description: 'A powerful table data analysis platform with AI-powered insights, visualization, and more.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tableanalysis.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available with Pro and Enterprise plans',
    },
    featureList: [
      'CSV and Excel file import',
      'Data visualization and charts',
      'Pivot tables',
      'AI-powered data analysis',
      'Export to multiple formats',
    ],
  }

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}