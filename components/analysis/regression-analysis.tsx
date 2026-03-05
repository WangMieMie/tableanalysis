'use client'

import { useState, useMemo } from 'react'
import { Column, Row } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import {
  simpleLinearRegression,
  multipleLinearRegression,
  LinearRegressionResult,
  MultipleRegressionResult,
} from '@/lib/statistics/regression'

interface RegressionAnalysisProps {
  columns: Column[]
  rows: Row[]
}

type RegressionType = 'simple' | 'multiple'

export function RegressionAnalysis({ columns, rows }: RegressionAnalysisProps) {
  const t = useTranslations('analysis.regression')

  const [regressionType, setRegressionType] = useState<RegressionType>('simple')
  const [dependentVariable, setDependentVariable] = useState<string>('')
  const [independentVariables, setIndependentVariables] = useState<string[]>([])
  const [result, setResult] = useState<LinearRegressionResult | MultipleRegressionResult | null>(null)

  const numericColumns = columns.filter(c => c.type === 'number')

  const toggleIndependentVariable = (varId: string) => {
    setIndependentVariables(prev => {
      if (prev.includes(varId)) {
        return prev.filter(v => v !== varId)
      }
      return [...prev, varId]
    })
  }

  const runRegression = () => {
    if (!dependentVariable || independentVariables.length === 0) return

    if (regressionType === 'simple' && independentVariables.length === 1) {
      const y = rows.map(r => Number(r[dependentVariable])).filter(v => !isNaN(v))
      const x = rows.map(r => Number(r[independentVariables[0]])).filter(v => !isNaN(v))
      const xName = columns.find(c => c.id === independentVariables[0])?.name || 'X'
      const regressionResult = simpleLinearRegression(x, y, xName)
      setResult(regressionResult)
    } else {
      const y = rows.map(r => Number(r[dependentVariable]))
      const X = rows.map(r => independentVariables.map(vId => Number(r[vId])))
      const varNames = independentVariables.map(vId => columns.find(c => c.id === vId)?.name || vId)
      const regressionResult = multipleLinearRegression(X, y, varNames)
      setResult(regressionResult)
    }
  }

  const formatNumber = (n: number | undefined, decimals = 4) => {
    if (n === undefined || isNaN(n)) return '-'
    return n.toFixed(decimals)
  }

  const isSimpleResult = (r: typeof result): r is LinearRegressionResult => {
    return r !== null && 'slope' in r
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>Build predictive models from your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Regression Type */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Regression Type</Label>
          <div className="flex gap-2">
            <Button
              variant={regressionType === 'simple' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRegressionType('simple')}
              className={regressionType === 'simple' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {t('linear')}
            </Button>
            <Button
              variant={regressionType === 'multiple' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRegressionType('multiple')}
              className={regressionType === 'multiple' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {t('multiple')}
            </Button>
          </div>
        </div>

        {/* Variable Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">{t('dependentVariable')}</Label>
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
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">{t('independentVariables')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {numericColumns
              .filter(col => col.id !== dependentVariable)
              .map(col => (
                <button
                  key={col.id}
                  onClick={() => toggleIndependentVariable(col.id)}
                  disabled={regressionType === 'simple' && independentVariables.length === 1 && !independentVariables.includes(col.id)}
                  className={`p-2 rounded-md border text-left text-sm transition-colors ${
                    independentVariables.includes(col.id)
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {col.name}
                </button>
              ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {regressionType === 'simple' ? 'Select 1 variable' : `Selected: ${independentVariables.length} variables`}
          </p>
        </div>

        {/* Run Button */}
        <Button
          onClick={runRegression}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!dependentVariable || independentVariables.length === 0}
        >
          Run Regression
        </Button>

        {/* Results */}
        {result && (
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <h4 className="font-semibold text-lg">Regression Results</h4>

            {/* Model Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">{t('rSquared')}</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {formatNumber(result.rSquared, 4)}
                </div>
                <div className="text-xs text-gray-400">
                  {((result.rSquared || 0) * 100).toFixed(1)}% variance explained
                </div>
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">{t('adjustedRSquared')}</div>
                <div className="text-xl font-bold">
                  {formatNumber(result.adjustedRSquared, 4)}
                </div>
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">{t('standardError')}</div>
                <div className="text-xl font-bold">
                  {formatNumber(result.standardError)}
                </div>
              </div>

              {'fStatistic' in result && (
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-xs text-gray-500">F-Statistic</div>
                  <div className="text-xl font-bold">
                    {formatNumber(result.fStatistic, 2)}
                  </div>
                  <div className="text-xs text-gray-400">
                    p = {formatNumber(result.fPValue, 4)}
                  </div>
                </div>
              )}
            </div>

            {/* Coefficients Table */}
            <div>
              <h5 className="text-sm font-medium mb-2">Coefficients</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Variable</th>
                      <th className="text-right py-2 px-3">{t('coefficient')}</th>
                      <th className="text-right py-2 px-3">{t('standardError')}</th>
                      <th className="text-right py-2 px-3">t-value</th>
                      <th className="text-right py-2 px-3">p-value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.coefficients.map((coef, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 px-3 font-medium">{coef.variable}</td>
                        <td className="text-right py-2 px-3">{formatNumber(coef.value, 4)}</td>
                        <td className="text-right py-2 px-3">{formatNumber(coef.standardError, 4)}</td>
                        <td className="text-right py-2 px-3">{formatNumber(coef.tValue, 2)}</td>
                        <td className="text-right py-2 px-3">
                          <span className={`${coef.pValue < 0.05 ? 'text-green-600 font-medium' : ''}`}>
                            {coef.pValue < 0.001 ? '< 0.001' : formatNumber(coef.pValue, 4)}
                            {coef.pValue < 0.05 && ' *'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Regression Equation */}
            {isSimpleResult(result) && (
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Regression Equation</div>
                <div className="font-mono text-lg">
                  y = {formatNumber(result.intercept, 4)} + {formatNumber(result.slope, 4)} × x
                </div>
              </div>
            )}

            {/* Interpretation */}
            <div className="bg-indigo-50 p-4 rounded-md">
              <h5 className="text-sm font-medium text-indigo-800 mb-2">Interpretation</h5>
              <p className="text-sm text-indigo-700">
                The model explains {((result.rSquared || 0) * 100).toFixed(1)}% of the variance in the dependent variable.
                {result.rSquared && result.rSquared > 0.7
                  ? ' This indicates a strong fit.'
                  : result.rSquared && result.rSquared > 0.4
                  ? ' This indicates a moderate fit.'
                  : ' This indicates a weak fit.'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}