import {useTranslations} from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, PlusCircle, Table2 } from 'lucide-react'

export default function DashboardPage() {
  const t = useTranslations('dashboard')

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
                <Link href="/dashboard" className="text-gray-900 font-medium">
                  {t('title')}
                </Link>
                <Link href="/dashboard/tables" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Tables
                </Link>
                <Link href="/dashboard/settings" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Settings
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('welcome')}</h1>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:border-gray-300 transition-colors cursor-pointer">
            <Link href="/dashboard/tables/new">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <PlusCircle className="h-6 w-6 text-gray-600" />
                  <CardTitle className="text-lg">{t('newTable')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Create a new table and enter data manually</CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-gray-300 transition-colors cursor-pointer">
            <Link href="/dashboard/tables/import">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Upload className="h-6 w-6 text-gray-600" />
                  <CardTitle className="text-lg">{t('uploadFile')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Import data from CSV or Excel files</CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-gray-300 transition-colors cursor-pointer">
            <Link href="/dashboard/tables">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Table2 className="h-6 w-6 text-gray-600" />
                  <CardTitle className="text-lg">{t('recentTables')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>View and manage your saved tables</CardDescription>
              </CardContent>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  )
}