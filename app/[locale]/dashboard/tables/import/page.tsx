'use client'

import { useState } from 'react'
import { useFileParser } from '@/hooks/use-file-parser'
import { useTableData } from '@/hooks/use-table-data'
import { FileUploader } from '@/components/table/file-uploader'
import { TableEditor } from '@/components/table/table-editor'
import { StatisticsPanel } from '@/components/analysis/statistics-panel'
import { ChartBuilder } from '@/components/charts/chart-builder'
import { PivotTable } from '@/components/analysis/pivot-table'
import { AIAnalyzer } from '@/components/analysis/ai-analyzer'
import { ExportButton } from '@/components/table/export-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Table2 } from 'lucide-react'

export default function TableImportPage() {
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
    renameColumn,
    changeColumnType,
    getStatistics,
  } = useTableData()

  const handleDataLoaded = (result: { columns: any[]; rows: any[] }) => {
    setTableData({
      id: `table-${Date.now()}`,
      name: 'Imported Data',
      columns: result.columns,
      rows: result.rows,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const handleAddRow = () => {
    if (columns.length > 0) {
      addRow()
    }
  }

  const handleAddColumn = () => {
    const name = prompt('Enter column name:')
    if (name) {
      addColumn(name, 'text')
    }
  }

  const statistics = getStatistics()

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
              <h1 className="text-lg font-semibold text-gray-900">
                {tableData?.name || 'Import Data'}
              </h1>
            </div>
            {tableData && (
              <div className="flex items-center space-x-2">
                <ExportButton
                  columns={columns}
                  rows={rows}
                  filename={tableData.name}
                />
                <Button size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!tableData ? (
          <FileUploader onDataLoaded={handleDataLoaded} />
        ) : (
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
                <AIAnalyzer
                  columns={columns}
                  rows={rows}
                  datasetName={tableData.name}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}