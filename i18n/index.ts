import {getRequestConfig} from 'next-intl/server'
import {locales, type Locale} from './request'

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale

  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'en'
  }

  return {
    locale,
    messages: (await import(`./dictionaries/${locale}.json`)).default
  }
})