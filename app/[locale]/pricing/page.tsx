import {useTranslations} from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

const plans = [
  {
    id: 'free',
    priceId: null,
    highlight: false,
  },
  {
    id: 'pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    highlight: true,
  },
  {
    id: 'enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    highlight: false,
  },
]

export default function PricingPage() {
  const t = useTranslations('pricing')

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              TableAnalysis
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
            <p className="mt-4 text-lg text-gray-600">{t('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const planName = plan.id as 'free' | 'pro' | 'enterprise'
              const isPro = plan.id === 'pro'

              return (
                <Card
                  key={plan.id}
                  className={isPro ? 'border-2 border-gray-900 relative' : ''}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{t(`plans.${planName}.name`)}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{t(`plans.${planName}.price`)}</span>
                      <span className="text-gray-600">{t(`plans.${planName}.period`)}</span>
                    </div>
                    <CardDescription className="mt-2">
                      {t(`plans.${planName}.description`)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">
                            {t(`plans.${planName}.features.${i}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {plan.id === 'free' ? (
                      <Link href="/auth/signup" className="w-full">
                        <Button variant="outline" className="w-full">
                          {t(`plans.${planName}.cta`)}
                        </Button>
                      </Link>
                    ) : plan.id === 'enterprise' ? (
                      <Link href="mailto:sales@tableanalysis.com" className="w-full">
                        <Button variant="outline" className="w-full">
                          {t(`plans.${planName}.cta`)}
                        </Button>
                      </Link>
                    ) : (
                      <form action="/api/stripe/checkout" method="POST" className="w-full">
                        <input type="hidden" name="priceId" value={plan.priceId || ''} />
                        <Button type="submit" className="w-full">
                          {t(`plans.${planName}.cta`)}
                        </Button>
                      </form>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}