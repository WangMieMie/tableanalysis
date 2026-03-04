import {useTranslations} from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileSpreadsheet, MoreVertical } from 'lucide-react'

// Mock data - in production this would come from Supabase
const mockTables = [
  { id: '1', name: 'Sales Data 2024', rows: 150, columns: 8, updatedAt: '2024-01-15' },
  { id: '2', name: 'Customer Survey Results', rows: 500, columns: 12, updatedAt: '2024-01-10' },
  { id: '3', name: 'Product Inventory', rows: 75, columns: 5, updatedAt: '2024-01-08' },
]

export default function TablesPage() {
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
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/tables" className="text-gray-900 font-medium">
                  {t('tables')}
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('tables')}</h1>
          <div className="flex space-x-3">
            <Link href="/dashboard/tables/import">
              <Button variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Import File
              </Button>
            </Link>
            <Link href="/dashboard/tables/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Table
              </Button>
            </Link>
          </div>
        </div>

        {/* Tables Grid */}
        {mockTables.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tables yet</h3>
              <p className="text-gray-500 mb-4">Create a new table or import data to get started</p>
              <Link href="/dashboard/tables/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Table
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTables.map((table) => (
              <Link key={table.id} href={`/dashboard/tables/${table.id}`}>
                <Card className="hover:border-gray-300 transition-colors cursor-pointer">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{table.name}</CardTitle>
                      <CardDescription>
                        {table.rows} rows · {table.columns} columns
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.preventDefault()
                      // Open menu for delete/rename
                    }}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Updated {table.updatedAt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}