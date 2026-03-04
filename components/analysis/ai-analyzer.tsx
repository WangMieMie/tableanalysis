'use client'

import { useState, useEffect } from 'react'
import { Column, Row } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, AlertCircle, Loader2, Zap } from 'lucide-react'
import Link from 'next/link'

interface AIAnalyzerProps {
  columns: Column[]
  rows: Row[]
  datasetName: string
}

interface AnalysisReport {
  overview: string
  statistics: string
  quality: string
  trends: string
  recommendations: string
}

interface UsageInfo {
  remaining: number | null
  limit: number | null
}

export function AIAnalyzer({ columns, rows, datasetName }: AIAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [usage, setUsage] = useState<UsageInfo | null>(null)

  // Fetch usage info on mount
  useEffect(() => {
    fetchUsageInfo()
  }, [])

  const fetchUsageInfo = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch {
      // Ignore errors for usage fetch
    }
  }

  const handleAnalyze = async () => {
    if (!agreed) return

    setIsAnalyzing(true)
    setError(null)
    setErrorCode(null)

    try {
      // Prepare sample data (first 100 rows)
      const sampleData = rows.slice(0, 100).map(row => {
        const obj: Record<string, unknown> = {}
        columns.forEach(col => {
          obj[col.name] = row[col.id]
        })
        return obj
      })

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName,
          columns: columns.map(c => ({ name: c.name, type: c.type })),
          sampleData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'LIMIT_EXCEEDED') {
          setErrorCode('LIMIT_EXCEEDED')
          setError(`You've reached your monthly AI analysis limit (${data.limit} analyses). Upgrade to Pro for unlimited analyses.`)
        } else if (data.code === 'UNAUTHORIZED') {
          setErrorCode('UNAUTHORIZED')
          setError('Please sign in to use AI analysis.')
        } else {
          throw new Error(data.error || 'Failed to analyze data')
        }
        return
      }

      setReport(data.report)
      setUsage(data.usage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Analysis
          {usage && usage.limit !== null && (
            <span className="text-sm font-normal text-gray-500 ml-auto">
              {usage.remaining ?? 0}/{usage.limit} remaining
            </span>
          )}
          {usage && usage.limit === null && (
            <span className="text-sm font-normal text-green-600 ml-auto flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Unlimited
            </span>
          )}
        </CardTitle>
        <CardDescription>Get AI-powered insights and recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        {!report && !isAnalyzing && (
          <div className="space-y-4">
            {errorCode === 'LIMIT_EXCEEDED' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Limit Reached</p>
                    <p className="text-amber-700 mt-1">{error}</p>
                    <Link href="/pricing" className="inline-block mt-2">
                      <Button size="sm" variant="outline">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {errorCode !== 'LIMIT_EXCEEDED' && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-2">Privacy Notice</p>
                  <p>
                    Your data sample (first 100 rows) will be sent to our AI for analysis.
                    We do not store your data beyond the analysis session.
                  </p>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to send my data sample for AI analysis
                  </span>
                </label>

                <Button onClick={handleAnalyze} disabled={!agreed}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Report
                </Button>
              </>
            )}

            {errorCode === 'UNAUTHORIZED' && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {error}
                <Link href="/auth/login" className="underline">
                  Sign in
                </Link>
              </div>
            )}

            {error && !errorCode && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-gray-600">Analyzing your data...</p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Overview</h4>
              <p className="text-gray-600 text-sm">{report.overview}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Data Quality</h4>
              <p className="text-gray-600 text-sm">{report.quality}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Trends & Patterns</h4>
              <p className="text-gray-600 text-sm">{report.trends}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
              <p className="text-gray-600 text-sm">{report.recommendations}</p>
            </div>

            <Button variant="outline" onClick={() => setReport(null)}>
              Generate New Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}