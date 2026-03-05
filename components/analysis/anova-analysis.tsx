'use client'

import { useState, useMemo } from 'react'
import { Column, Row } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import {
  oneWayANOVA,
  OneWayANOVAOutput,
} from '@/lib/statistics/anova'

interface ANOVAAnalysisProps {
  columns: Column[]
  rows: Row[]
}

export function ANOVAAnalysis({ columns, rows }: ANOVAAnalysisProps) {
  const t = useTranslations('analysis.anova')

  const [dependentVariable, setDependentVariable] = useState<string>('')
  const [groupingVariable, setGroupingVariable] = useState<string>('')
  const [result, setResult] = useState<OneWayANOVAOutput | null>(null)

  const numericColumns = columns.filter(c => c.type === 'number')
  const categoricalColumns = columns.filter(c => c.type === 'text')

  const groups = useMemo(() => {
    if (!groupingVariable) return []
    const groupMap = new Map<string, number[]>()

    rows.forEach(row => {
      const group = String(row[groupingVariable])
      const value = Number(row[dependentVariable])

      if (!isNaN(value)) {
        if (!groupMap.has(group)) {
          groupMap.set(group, [])
        }
        groupMap.get(group)!.push(value)
      }
    })

    return Array.from(groupMap.entries()).map(([name, values]) => ({
      name,
      values,
    }))
  }, [groupingVariable, dependentVariable, rows])

  const runANOVA = () => {
    if (groups.length >= 2) {
      const anovaResult = oneWayANOVA(groups)
      setResult(anovaResult)
    }
  }

  const formatNumber = (n: number | undefined | null, decimals = 4) => {
    if (n === undefined || n === null || isNaN(n)) return '-'
    return n.toFixed(decimals)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>Compare means across multiple groups</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Variable Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">{t('dependentVariable') || 'Dependent Variable'}</Label>
            <select
              className="w-full mt-2 px-3 py-2 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={dependentVariable}
              onChange={e => setDependentVariable(e.target.value)}
            >
              <option value="">Select...</option>
              {numericColumns.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-sm font-medium">{t('groupingVariable') || 'Grouping Variable'}</Label>
            <select
              className="w-full mt-2 px-3 py-2 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={groupingVariable}
              onChange={e => setGroupingVariable(e.target.value)}
            >
              <option value="">Select...</option>
              {categoricalColumns.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Group Summary */}
        {groups.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm font-medium mb-2">Groups ({groups.length})</div>
            <div className="flex flex-wrap gap-2">
              {groups.map(g => (
                <div key={g.name} className="bg-white px-2 py-1 rounded text-xs">
                  {g.name} (n={g.values.length})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Run Button */}
        <Button
          onClick={runANOVA}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!dependentVariable || !groupingVariable || groups.length < 2}
        >
          Run ANOVA
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* ANOVA Table */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-lg mb-4">ANOVA Table</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-white">
                      <th className="text-left py-2 px-3">Source</th>
                      <th className="text-right py-2 px-3">{t('sumOfSquares')}</th>
                      <th className="text-right py-2 px-3">df</th>
                      <th className="text-right py-2 px-3">{t('meanSquare')}</th>
                      <th className="text-right py-2 px-3">{t('fValue')}</th>
                      <th className="text-right py-2 px-3">p-value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.anova.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 px-3 font-medium">{row.source}</td>
                        <td className="text-right py-2 px-3">{formatNumber(row.sumOfSares, 2)}</td>
                        <td className="text-right py-2 px-3">{row.degreesOfFreedom}</td>
                        <td className="text-right py-2 px-3">
                          {!isNaN(row.meanSquare) ? formatNumber(row.meanSquare, 2) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {!isNaN(row.fValue) ? formatNumber(row.fValue, 2) : '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {!isNaN(row.pValue) ? (
                            <span className={row.pValue < 0.05 ? 'text-green-600 font-medium' : ''}>
                              {row.pValue < 0.001 ? '< 0.001' : formatNumber(row.pValue, 4)}
                              {row.pValue < 0.05 && ' *'}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Group Statistics */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-lg mb-4">Group Statistics</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-white">
                      <th className="text-left py-2 px-3">Group</th>
                      <th className="text-right py-2 px-3">N</th>
                      <th className="text-right py-2 px-3">Mean</th>
                      <th className="text-right py-2 px-3">Std. Dev.</th>
                      <th className="text-right py-2 px-3">Std. Error</th>
                      <th className="text-right py-2 px-3">95% CI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.groups.map((group, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 px-3 font-medium">{group.name}</td>
                        <td className="text-right py-2 px-3">{group.n}</td>
                        <td className="text-right py-2 px-3">{formatNumber(group.mean, 2)}</td>
                        <td className="text-right py-2 px-3">{formatNumber(group.stdDev, 2)}</td>
                        <td className="text-right py-2 px-3">{formatNumber(group.stdError, 3)}</td>
                        <td className="text-right py-2 px-3">
                          [{formatNumber(group.confidenceInterval[0], 2)}, {formatNumber(group.confidenceInterval[1], 2)}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Post-Hoc Tests */}
            {result.postHoc && result.postHoc.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-lg mb-2">{t('postHoc')} - {t('tukeyHSD')}</h4>
                <p className="text-xs text-gray-500 mb-4">
                  Post-hoc comparisons are performed when ANOVA shows significant differences.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b bg-white">
                        <th className="text-left py-2 px-3">Comparison</th>
                        <th className="text-right py-2 px-3">Mean Diff</th>
                        <th className="text-right py-2 px-3">SE</th>
                        <th className="text-right py-2 px-3">q</th>
                        <th className="text-right py-2 px-3">p-value</th>
                        <th className="text-center py-2 px-3">Significant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.postHoc.map((ph, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 px-3 font-medium">{ph.comparison}</td>
                          <td className="text-right py-2 px-3">{formatNumber(ph.meanDifference, 2)}</td>
                          <td className="text-right py-2 px-3">{formatNumber(ph.standardError, 3)}</td>
                          <td className="text-right py-2 px-3">{formatNumber(ph.qStatistic, 2)}</td>
                          <td className="text-right py-2 px-3">
                            <span className={ph.significant ? 'text-green-600 font-medium' : ''}>
                              {formatNumber(ph.pValue, 4)}
                            </span>
                          </td>
                          <td className="text-center py-2 px-3">
                            {ph.significant ? (
                              <span className="text-green-600">Yes *</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Conclusion */}
            <div className={`p-4 rounded-md ${result.significant ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
              <h5 className="font-medium mb-2">Conclusion</h5>
              <p className="text-sm">
                {result.significant
                  ? `There is a statistically significant difference between the group means (p < 0.05). At least one group differs significantly from the others.`
                  : `There is no statistically significant difference between the group means (p ≥ 0.05). The groups appear to have similar means.`
                }
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}