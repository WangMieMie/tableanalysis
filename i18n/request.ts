import {notFound} from 'next/navigation'
import {getRequestConfig} from 'next-intl/server'
import {routing} from './routing'

export type Locale = (typeof routing.locales)[number]

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as Locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`./dictionaries/${locale}.json`)).default
  }
})