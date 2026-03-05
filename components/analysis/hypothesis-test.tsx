'use client'

import { useState, useMemo } from 'react'
import { Column, Row } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import {
  oneSampleTTest,
  pairedTTest,
  independentTTest,
  TTestResult,
} from '@/lib/statistics/hypothesis'

interface HypothesisTestProps {
  columns: Column[]
  rows: Row[]
}

type TestType = 'oneSample' | 'paired' | 'independent'

export function HypothesisTest({ columns, rows }: HypothesisTestProps) {
  const t = useTranslations('analysis.hypothesis')

  const [testType, setTestType] = useState<TestType>('oneSample')
  const [selectedVariable, setSelectedVariable] = useState<string>(
    columns.find(c => c.type === 'number')?.id || ''
  )
  const [selectedVariable2, setSelectedVariable2] = useState<string>('')
  const [groupingVariable, setGroupingVariable] = useState<string>('')
  const [testValue, setTestValue] = useState<number>(0)
  const [alpha, setAlpha] = useState<number>(0.05)
  const [result, setResult] = useState<TTestResult | null>(null)

  const numericColumns = columns.filter(c => c.type === 'number')
  const categoricalColumns = columns.filter(c => c.type === 'text')

  const uniqueGroups = useMemo(() => {
    if (!groupingVariable) return []
    const groups = new Set(rows.map(r => r[groupingVariable]))
    return Array.from(groups).filter(g => g !== null && g !== undefined)
  }, [groupingVariable, rows])

  const runTest = () => {
    let testResult: TTestResult | null = null

    switch (testType) {
      case 'oneSample':
        if (selectedVariable) {
          const values = rows
            .map(r => Number(r[selectedVariable]))
            .filter(v => !isNaN(v))
          testResult = oneSampleTTest(values, testValue, alpha)
        }
        break

      case 'paired':
        if (selectedVariable && selectedVariable2) {
          const values1 = rows.map(r => Number(r[selectedVariable])).filter(v => !isNaN(v))
          const values2 = rows.map(r => Number(r[selectedVariable2])).filter(v => !isNaN(v))
          if (values1.length === values2.length) {
            testResult = pairedTTest(values1, values2, alpha)
          }
        }
        break

      case 'independent':
        if (selectedVariable && groupingVariable && uniqueGroups.length >= 2) {
          const group1Values = rows
            .filter(r => r[groupingVariable] === uniqueGroups[0])
            .map(r => Number(r[selectedVariable]))
            .filter(v => !isNaN(v))
          const group2Values = rows
            .filter(r => r[groupingVariable] === uniqueGroups[1])
            .map(r => Number(r[selectedVariable]))
            .filter(v => !isNaN(v))
          testResult = independentTTest(group1Values, group2Values, alpha)
        }
        break
    }

    setResult(testResult)
  }

  const formatNumber = (n: number | undefined, decimals = 4) => {
    if (n === undefined || isNaN(n)) return '-'
    return n.toFixed(decimals)
  }

  const getPValueInterpretation = (pValue: number) => {
    if (pValue < 0.001) return 'p < 0.001 ***'
    if (pValue < 0.01) return `p = ${pValue.toFixed(3)} **`
    if (pValue < 0.05) return `p = ${pValue.toFixed(3)} *`
    return `p = ${pValue.toFixed(3)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>Perform statistical hypothesis tests on your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Type Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">{t('tTest')}</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={testType === 'oneSample' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTestType('oneSample')}
              className={testType === 'oneSample' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {t('oneSampleTTest')}
            </Button>
            <Button
              variant={testType === 'paired' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTestType('paired')}
              className={testType === 'paired' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {t('pairedTTest')}
            </Button>
            <Button
              variant={testType === 'independent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTestType('independent')}
              className={testType === 'independent' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {t('independentTTest')}
            </Button>
          </div>
        </div>

        {/* Variable Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">{t('selectVariable')}</Label>
            <select
              className="w-full mt-2 px-3 py-2 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={selectedVariable}
              onChange={e => setSelectedVariable(e.target.value)}
            >
              {numericColumns.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>

          {testType === 'oneSample' && (
            <div>
              <Label className="text-sm font-medium">{t('testValue')}</Label>
              <input
                type="number"
                className="w-full mt-2 px-3 py-2 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={testValue}
                onChange={e => setTestValue(Number(e.target.value))}
              />
            </div>
          )}

          {testType === 'paired' && (
            <div>
              <Label className="text-sm font-medium">{t('selectVariable')} 2</Label>
              <select
                className="w-full mt-2 px-3 py-2 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={selectedVariable2}
                onChange={e => setSelectedVariable2(e.target.value)}
              >
                {numericColumns.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>
          )}

          {testType === 'independent' && (
            <div>
              <Label className="text-sm font-medium">{t('selectGrouping')}</Label>
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
              {uniqueGroups.length >= 2 && (
                <p className="text-xs text-gray-500 mt-1">
                  Groups: {String(uniqueGroups[0])} vs {String(uniqueGroups[1])}
                </p>
              )}
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Significance Level (α)</Label>
            <select
              className="w-full mt-2 px-3 py-2 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={alpha}
              onChange={e => setAlpha(Number(e.target.value))}
            >
              <option value={0.01}>0.01 (1%)</option>
              <option value={0.05}>0.05 (5%)</option>
              <option value={0.1}>0.10 (10%)</option>
            </select>
          </div>
        </div>

        {/* Run Test Button */}
        <Button
          onClick={runTest}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={
            !selectedVariable ||
            (testType === 'paired' && !selectedVariable2) ||
            (testType === 'independent' && (!groupingVariable || uniqueGroups.length < 2))
          }
        >
          Run Test
        </Button>

        {/* Results */}
        {result && (
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <h4 className="font-semibold text-lg">Results</h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">{t('tStatistic')}</div>
                <div className="text-xl font-bold text-indigo-600">
                  {formatNumber(result.tStatistic, 3)}
                </div>
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">{t('pValue')}</div>
                <div className={`text-xl font-bold ${result.significant ? 'text-green-600' : 'text-gray-600'}`}>
                  {getPValueInterpretation(result.pValue)}
                </div>
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">{t('degreesOfFreedom')}</div>
                <div className="text-xl font-bold">{result.degreesOfFreedom}</div>
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-xs text-gray-500">{t('meanDifference')}</div>
                <div className="text-xl font-bold">{formatNumber(result.meanDifference)}</div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-xs text-gray-500 mb-1">{t('confidenceInterval')}</div>
              <div className="text-lg font-medium">
                [{formatNumber(result.confidenceInterval.lower)}, {formatNumber(result.confidenceInterval.upper)}]
              </div>
            </div>

            <div className={`p-4 rounded-md ${result.significant ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-2">
                {result.significant ? (
                  <>
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="font-medium text-green-700">{t('rejectNull')}</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400 text-xl">○</span>
                    <span className="font-medium text-gray-600">{t('failToRejectNull')}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {result.significant
                  ? `The result is statistically significant at α = ${alpha}. There is sufficient evidence to reject the null hypothesis.`
                  : `The result is not statistically significant at α = ${alpha}. There is insufficient evidence to reject the null hypothesis.`
                }
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}