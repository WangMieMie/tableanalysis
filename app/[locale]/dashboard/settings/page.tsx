import {useTranslations} from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const t = useTranslations('settings')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
                TableAnalysis
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/tables" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Tables
                </Link>
                <Link href="/dashboard/settings" className="text-gray-900 font-medium">
                  {t('title')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="ghost">Logout</Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('title')}</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('profile.email')}</label>
                <p className="text-gray-600">user@example.com</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('profile.name')}</label>
                <p className="text-gray-600">John Doe</p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('subscription.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('subscription.currentPlan')}</label>
                  <p className="text-gray-600">Free</p>
                </div>
                <Link href="/pricing">
                  <Button>{t('subscription.upgrade')}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Usage Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('usage.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('usage.datasets')}</span>
                  <span className="font-medium">1 / 3</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-600 h-2 rounded-full" style={{ width: '33%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('usage.aiAnalysis')} ({t('usage.thisMonth')})</span>
                  <span className="font-medium">2 / 5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-600 h-2 rounded-full" style={{ width: '40%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}