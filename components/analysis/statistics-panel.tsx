'use client'

import { Column } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface StatisticsPanelProps {
  columns: Column[]
  statistics: Record<string, {
    count: number
    sum?: number
    average?: number
    min?: number
    max?: number
    median?: number
    stdDev?: number
    nullCount: number
    uniqueCount?: number
  }>
}

export function StatisticsPanel({ columns, statistics }: StatisticsPanelProps) {
  const numericColumns = columns.filter(col => col.type === 'number')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
        <CardDescription>Statistical summary of your data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">Column</th>
                <th className="text-right py-2 px-3">Count</th>
                <th className="text-right py-2 px-3">Null</th>
                <th className="text-right py-2 px-3">Unique</th>
                {numericColumns.length > 0 && (
                  <>
                    <th className="text-right py-2 px-3">Sum</th>
                    <th className="text-right py-2 px-3">Avg</th>
                    <th className="text-right py-2 px-3">Min</th>
                    <th className="text-right py-2 px-3">Max</th>
                    <th className="text-right py-2 px-3">Median</th>
                    <th className="text-right py-2 px-3">Std Dev</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {columns.map(col => {
                const stats = statistics[col.name] || {}
                const isNumeric = col.type === 'number'

                return (
                  <tr key={col.id} className="border-b last:border-0">
                    <td className="py-2 px-3 font-medium">{col.name}</td>
                    <td className="text-right py-2 px-3">{stats.count || 0}</td>
                    <td className="text-right py-2 px-3">{stats.nullCount || 0}</td>
                    <td className="text-right py-2 px-3">{stats.uniqueCount || 0}</td>
                    {numericColumns.length > 0 && (
                      <>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.sum !== undefined ? stats.sum.toFixed(2) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.average !== undefined ? stats.average.toFixed(2) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.min !== undefined ? stats.min.toFixed(2) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.max !== undefined ? stats.max.toFixed(2) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.median !== undefined ? stats.median.toFixed(2) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.stdDev !== undefined ? stats.stdDev.toFixed(2) : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}