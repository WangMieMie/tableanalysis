'use client'

import { useState, useEffect } from 'react'
import { useTableData } from '@/hooks/use-table-data'
import { TableEditor } from '@/components/table/table-editor'
import { StatisticsPanel } from '@/components/analysis/statistics-panel'
import { ChartBuilder } from '@/components/charts/chart-builder'
import { PivotTable } from '@/components/analysis/pivot-table'
import { AIAnalyzer } from '@/components/analysis/ai-analyzer'
import { ExportButton } from '@/components/table/export-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Table2, Loader2 } from 'lucide-react'

// Mock data for demonstration
const mockTableData = {
  id: '1',
  name: 'Sales Data 2024',
  columns: [
    { id: 'col-1', name: 'Date', type: 'date' as const },
    { id: 'col-2', name: 'Product', type: 'text' as const },
    { id: 'col-3', name: 'Revenue', type: 'number' as const },
    { id: 'col-4', name: 'Units', type: 'number' as const },
    { id: 'col-5', name: 'Region', type: 'text' as const },
  ],
  rows: [
    { id: 'row-1', 'col-1': '2024-01-01', 'col-2': 'Widget A', 'col-3': 1500, 'col-4': 150, 'col-5': 'North' },
    { id: 'row-2', 'col-1': '2024-01-02', 'col-2': 'Widget B', 'col-3': 2300, 'col-4': 230, 'col-5': 'South' },
    { id: 'row-3', 'col-1': '2024-01-03', 'col-2': 'Widget A', 'col-3': 1800, 'col-4': 180, 'col-5': 'East' },
    { id: 'row-4', 'col-1': '2024-01-04', 'col-2': 'Widget C', 'col-3': 3200, 'col-4': 320, 'col-5': 'West' },
    { id: 'row-5', 'col-1': '2024-01-05', 'col-2': 'Widget B', 'col-3': 2100, 'col-4': 210, 'col-5': 'North' },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export default function TableDetailPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [tableName, setTableName] = useState(mockTableData.name)

  const {
    tableData,
    setTableData,
    columns,
    rows,
    updateCell,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    getStatistics,
  } = useTableData(mockTableData)

  useEffect(() => {
    // Simulate loading data from API
    const timer = setTimeout(() => {
      setTableData(mockTableData)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [setTableData])

  const handleAddRow = () => {
    addRow()
  }

  const handleAddColumn = () => {
    const name = prompt('Enter column name:')
    if (name) {
      addColumn(name, 'text')
    }
  }

  const statistics = getStatistics()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/tables" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="text-lg font-semibold border-0 bg-transparent focus-visible:ring-0 px-0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <ExportButton
                columns={columns}
                rows={rows}
                filename={tableName}
              />
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddRow}>
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
            <Button variant="outline" onClick={handleAddColumn}>
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">
                <Table2 className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="pivot">Pivot</TabsTrigger>
              <TabsTrigger value="ai">AI Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <TableEditor
                    columns={columns}
                    rows={rows}
                    onCellEdit={updateCell}
                    onDeleteRow={deleteRow}
                    onDeleteColumn={deleteColumn}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistics" className="mt-6">
              <StatisticsPanel columns={columns} statistics={statistics} />
            </TabsContent>

            <TabsContent value="charts" className="mt-6">
              <ChartBuilder columns={columns} rows={rows} />
            </TabsContent>

            <TabsContent value="pivot" className="mt-6">
              <PivotTable columns={columns} rows={rows} />
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              {tableData && (
                <AIAnalyzer
                  columns={columns}
                  rows={rows}
                  datasetName={tableName}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}