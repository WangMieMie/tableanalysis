'use client'

import { useState, useMemo } from 'react'
import { Column, Row } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import {
  pearsonCorrelation,
  spearmanCorrelation,
  kendallCorrelation,
  correlationMatrix,
  CorrelationResult,
  CorrelationMatrix,
} from '@/lib/statistics/correlation'

interface CorrelationAnalysisProps {
  columns: Column[]
  rows: Row[]
}

type CorrelationMethod = 'pearson' | 'spearman' | 'kendall'

export function CorrelationAnalysis({ columns, rows }: CorrelationAnalysisProps) {
  const t = useTranslations('analysis.correlation')

  const [method, setMethod] = useState<CorrelationMethod>('pearson')
  const [selectedVariables, setSelectedVariables] = useState<string[]>([])
  const [result, setResult] = useState<CorrelationResult | null>(null)
  const [matrixResult, setMatrixResult] = useState<CorrelationMatrix | null>(null)

  const numericColumns = columns.filter(c => c.type === 'number')

  const toggleVariable = (varId: string) => {
    setSelectedVariables(prev => {
      if (prev.includes(varId)) {
        return prev.filter(v => v !== varId)
      }
      return [...prev, varId]
    })
  }

  const runCorrelation = () => {
    if (selectedVariables.length === 2) {
      const col1 = selectedVariables[0]
      const col2 = selectedVariables[1]

      const values1 = rows.map(r => Number(r[col1])).filter(v => !isNaN(v))
      const values2 = rows.map(r => Number(r[col2])).filter(v => !isNaN(v))

      let correlationResult: CorrelationResult | null = null

      switch (method) {
        case 'pearson':
          correlationResult = pearsonCorrelation(values1, values2)
          break
        case 'spearman':
          correlationResult = spearmanCorrelation(values1, values2)
          break
        case 'kendall':
          correlationResult = kendallCorrelation(values1, values2)
          break
      }

      setResult(correlationResult)
      setMatrixResult(null)
    } else if (selectedVariables.length >= 2) {
      const data = rows.map(r => {
        const row: Record<string, number> = {}
        selectedVariables.forEach(varId => {
          row[varId] = Number(r[varId])
        })
        return row
      })

      const matrix = correlationMatrix(data, selectedVariables, method)
      setMatrixResult(matrix)
      setResult(null)
    }
  }

  const formatNumber = (n: number | undefined | null, decimals = 4) => {
    if (n === undefined || n === null || isNaN(n)) return '-'
    return n.toFixed(decimals)
  }

  const getCorrelationColor = (r: number) => {
    if (r >= 0.7) return 'bg-green-500 text-white'
    if (r >= 0.4) return 'bg-green-200 text-green-800'
    if (r >= 0.2) return 'bg-green-100 text-green-700'
    if (r <= -0.7) return 'bg-red-500 text-white'
    if (r <= -0.4) return 'bg-red-200 text-red-800'
    if (r <= -0.2) return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  const getCorrelationInterpretation = (r: number) => {
    const absR = Math.abs(r)
    const direction = r > 0 ? t('positive') : t('negative')
    const strength = absR >= 0.7 ? t('strong') : absR >= 0.4 ? t('moderate') : t('weak')
    return `${strength} ${direction} correlation`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>Measure relationships between variables</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Method Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Correlation Method</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={method === 'pearson' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMethod('pearson')}
              className={method === 'pearson' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {t('pearson')}
            </Button>
            <Button
              variant={method === 'spearman' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMethod('spearman')}
              className={method === 'spearman' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {t('spearman')}
            </Button>
            <Button
              variant={method === 'kendall' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMethod('kendall')}
              className={method === 'kendall' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {t('kendall')}
            </Button>
          </div>
        </div>

        {/* Variable Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">{t('selectVariables')} (select 2 or more)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {numericColumns.map(col => (
              <button
                key={col.id}
                onClick={() => toggleVariable(col.id)}
                className={`p-2 rounded-md border text-left text-sm transition-colors ${
                  selectedVariables.includes(col.id)
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {selectedVariables.length} variable(s)
          </p>
        </div>

        {/* Run Button */}
        <Button
          onClick={runCorrelation}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={selectedVariables.length < 2}
        >
          Calculate Correlation
        </Button>

        {/* Single Pair Result */}
        {result && (
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <h4 className="font-semibold text-lg">Correlation Result</h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">{t('correlationCoefficient')}</div>
                <div className={`text-2xl font-bold ${result.coefficient >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatNumber(result.coefficient, 3)}
                </div>
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">p-Value</div>
                <div className="text-xl font-bold">
                  {result.pValue < 0.001 ? '< 0.001' : formatNumber(result.pValue, 4)}
                </div>
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">Sample Size</div>
                <div className="text-xl font-bold">{result.n}</div>
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">Interpretation</div>
                <div className="text-sm font-medium">{result.interpretation}</div>
              </div>
            </div>
          </div>
        )}

        {/* Matrix Result */}
        {matrixResult && (
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <h4 className="font-semibold text-lg">{t('matrix')}</h4>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="p-2"></th>
                    {matrixResult.variables.map(v => (
                      <th key={v} className="p-2 text-xs font-medium text-gray-600">
                        {columns.find(c => c.id === v)?.name || v}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixResult.variables.map((rowVar, i) => (
                    <tr key={rowVar}>
                      <td className="p-2 text-xs font-medium text-gray-600">
                        {columns.find(c => c.id === rowVar)?.name || rowVar}
                      </td>
                      {matrixResult.matrix[i].map((cell, j) => (
                        <td key={j} className="p-1">
                          <div
                            className={`w-16 h-12 flex items-center justify-center rounded text-xs font-medium ${cell !== null ? getCorrelationColor(cell) : 'bg-gray-50 text-gray-400'}`}
                            title={cell !== null ? `r = ${formatNumber(cell, 3)}` : ''}
                          >
                            {cell !== null ? formatNumber(cell, 2) : '-'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Strong positive (≥ 0.7)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span>Moderate (0.4-0.7)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>Weak (&lt; 0.4)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-200 rounded"></div>
                <span>Moderate negative</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Strong negative (≤ -0.7)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}