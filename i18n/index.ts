import {getRequestConfig} from 'next-intl/server'
import {routing} from './routing'

export type Locale = (typeof routing.locales)[number]

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = 'en'
  }

  return {
    locale,
    messages: (await import(`./dictionaries/${locale}.json`)).default
  }
})