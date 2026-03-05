'use client'

import { Column } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

interface AdvancedStatistics {
  count: number
  sum?: number
  average?: number
  mean?: number
  min?: number
  max?: number
  median?: number
  mode?: number | string
  stdDev?: number
  variance?: number
  range?: number
  skewness?: number
  kurtosis?: number
  q1?: number
  q2?: number
  q3?: number
  iqr?: number
  nullCount: number
  uniqueCount?: number
}

interface StatisticsPanelProps {
  columns: Column[]
  statistics: Record<string, AdvancedStatistics>
}

export function StatisticsPanel({ columns, statistics }: StatisticsPanelProps) {
  const t = useTranslations('analysis.statistics')
  const numericColumns = columns.filter(col => col.type === 'number')

  const formatNumber = (value: number | undefined, decimals: number = 2): string => {
    if (value === undefined || value === null || isNaN(value)) return '-'
    return value.toFixed(decimals)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>Statistical summary of your data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-3 font-medium sticky left-0 bg-gray-50">{t('column') || 'Column'}</th>
                <th className="text-right py-2 px-3">{t('count')}</th>
                <th className="text-right py-2 px-3">{t('nullCount')}</th>
                <th className="text-right py-2 px-3">{t('uniqueCount')}</th>
                {numericColumns.length > 0 && (
                  <>
                    <th className="text-right py-2 px-3 border-l">{t('mean')}</th>
                    <th className="text-right py-2 px-3">{t('median')}</th>
                    <th className="text-right py-2 px-3">{t('mode')}</th>
                    <th className="text-right py-2 px-3">{t('stdDev')}</th>
                    <th className="text-right py-2 px-3">{t('variance')}</th>
                    <th className="text-right py-2 px-3">{t('min')}</th>
                    <th className="text-right py-2 px-3">{t('max')}</th>
                    <th className="text-right py-2 px-3">{t('range')}</th>
                    <th className="text-right py-2 px-3 border-l">{t('q1')}</th>
                    <th className="text-right py-2 px-3">{t('q3')}</th>
                    <th className="text-right py-2 px-3">{t('iqr')}</th>
                    <th className="text-right py-2 px-3 border-l">{t('skewness')}</th>
                    <th className="text-right py-2 px-3">{t('kurtosis')}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {columns.map(col => {
                const stats = statistics[col.name] || {}
                const isNumeric = col.type === 'number'

                return (
                  <tr key={col.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium sticky left-0 bg-white">{col.name}</td>
                    <td className="text-right py-2 px-3">{stats.count || 0}</td>
                    <td className="text-right py-2 px-3">{stats.nullCount || 0}</td>
                    <td className="text-right py-2 px-3">{stats.uniqueCount || 0}</td>
                    {numericColumns.length > 0 && (
                      <>
                        <td className="text-right py-2 px-3 border-l">
                          {isNumeric && stats.average !== undefined ? formatNumber(stats.average) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.median !== undefined ? formatNumber(stats.median) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.mode !== undefined ? (typeof stats.mode === 'number' ? formatNumber(stats.mode) : stats.mode) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.stdDev !== undefined ? formatNumber(stats.stdDev) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.variance !== undefined ? formatNumber(stats.variance) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.min !== undefined ? formatNumber(stats.min) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.max !== undefined ? formatNumber(stats.max) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.range !== undefined ? formatNumber(stats.range) : '-'}
                        </td>
                        <td className="text-right py-2 px-3 border-l">
                          {isNumeric && stats.q1 !== undefined ? formatNumber(stats.q1) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.q3 !== undefined ? formatNumber(stats.q3) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.iqr !== undefined ? formatNumber(stats.iqr) : '-'}
                        </td>
                        <td className="text-right py-2 px-3 border-l">
                          {isNumeric && stats.skewness !== undefined ? formatNumber(stats.skewness, 3) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {isNumeric && stats.kurtosis !== undefined ? formatNumber(stats.kurtosis, 3) : '-'}
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