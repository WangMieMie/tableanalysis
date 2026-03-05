'use client'

import { useState, useMemo } from 'react'
import { Column, Row, ChartType } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
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
  ScatterChart,
  Scatter,
  ComposedChart,
  Area,
  ReferenceLine,
} from 'recharts'
import { calculateAdvancedStatistics } from '@/lib/statistics/descriptive'

interface ChartBuilderProps {
  columns: Column[]
  rows: Row[]
}

const COLORS = ['#4F46E5', '#14B8A6', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export function ChartBuilder({ columns, rows }: ChartBuilderProps) {
  const t = useTranslations('analysis.charts')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [xAxis, setXAxis] = useState<string>(columns[0]?.id || '')
  const [yAxis, setYAxis] = useState<string>(columns.find(c => c.type === 'number')?.id || '')
  const [yAxis2, setYAxis2] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [bins, setBins] = useState<number>(10)

  const numericColumns = columns.filter(c => c.type === 'number')
  const allColumns = columns

  // Prepare chart data
  const chartData = useMemo(() => {
    return rows.map(row => ({
      name: String(row[xAxis] || ''),
      value: Number(row[yAxis]) || 0,
      value2: yAxis2 ? Number(row[yAxis2]) || 0 : undefined,
    })).slice(0, 50)
  }, [rows, xAxis, yAxis, yAxis2])

  // Histogram data
  const histogramData = useMemo(() => {
    if (chartType !== 'histogram' || !yAxis) return []

    const values = rows
      .map(row => Number(row[yAxis]))
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b)

    if (values.length === 0) return []

    const min = Math.min(...values)
    const max = Math.max(...values)
    const binWidth = (max - min) / bins

    const bins_data: { name: string; count: number; range: string }[] = []

    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth
      const binEnd = min + (i + 1) * binWidth
      const count = values.filter(v => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length

      bins_data.push({
        name: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
        count,
        range: `[${binStart.toFixed(1)}, ${binEnd.toFixed(1)})`,
      })
    }

    return bins_data
  }, [chartType, yAxis, rows, bins])

  // Box plot data
  const boxPlotData = useMemo(() => {
    if (chartType !== 'boxPlot') return []

    return numericColumns.map(col => {
      const values = rows
        .map(row => Number(row[col.id]))
        .filter(v => !isNaN(v))
        .sort((a, b) => a - b)

      if (values.length === 0) {
        return { name: col.name, min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0 }
      }

      const stats = calculateAdvancedStatistics(values)

      return {
        name: col.name,
        min: stats.min || 0,
        q1: stats.q1 || 0,
        median: stats.median || 0,
        q3: stats.q3 || 0,
        max: stats.max || 0,
        mean: stats.average || 0,
      }
    })
  }, [chartType, numericColumns, rows])

  // Scatter plot data
  const scatterData = useMemo(() => {
    if (chartType !== 'scatter') return []

    return rows
      .map(row => ({
        x: Number(row[xAxis]) || 0,
        y: Number(row[yAxis]) || 0,
        name: String(row[xAxis] || ''),
      }))
      .filter(d => !isNaN(d.x) && !isNaN(d.y))
      .slice(0, 100)
  }, [chartType, xAxis, yAxis, rows])

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="value" fill="#4F46E5" name={columns.find(c => c.id === yAxis)?.name || 'Value'} radius={[4, 4, 0, 0]} />
              {yAxis2 && <Bar dataKey="value2" fill="#14B8A6" name={columns.find(c => c.id === yAxis2)?.name || 'Value 2'} radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4F46E5"
                strokeWidth={2}
                name={columns.find(c => c.id === yAxis)?.name || 'Value'}
                dot={{ fill: '#4F46E5', strokeWidth: 2 }}
              />
              {yAxis2 && (
                <Line
                  type="monotone"
                  dataKey="value2"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  name={columns.find(c => c.id === yAxis2)?.name || 'Value 2'}
                  dot={{ fill: '#14B8A6', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'pie':
        const pieData = chartData.slice(0, 10)
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={40}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#6B7280' }}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                dataKey="x"
                name={columns.find(c => c.id === xAxis)?.name || 'X'}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis
                type="number"
                dataKey="y"
                name={columns.find(c => c.id === yAxis)?.name || 'Y'}
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Legend />
              <Scatter
                name={`${columns.find(c => c.id === xAxis)?.name || 'X'} vs ${columns.find(c => c.id === yAxis)?.name || 'Y'}`}
                data={scatterData}
                fill="#4F46E5"
              />
            </ScatterChart>
          </ResponsiveContainer>
        )

      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6B7280" angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [value, 'Count']}
              />
              <Bar dataKey="count" fill="#4F46E5" name="Frequency" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'boxPlot':
        return (
          <div className="space-y-4">
            {boxPlotData.map((data, index) => (
              <Card key={data.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{data.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={[data]} layout="vertical">
                        <XAxis type="number" domain={['auto', 'auto']} stroke="#6B7280" />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                        />
                        {/* Box (Q1 to Q3) */}
                        <Bar dataKey="q3" stackId="box" fill="#4F46E5" opacity={0.6} barSize={40} />
                        {/* Whiskers */}
                        <ReferenceLine x={data.min} stroke="#4F46E5" strokeDasharray="3 3" />
                        <ReferenceLine x={data.max} stroke="#4F46E5" strokeDasharray="3 3" />
                        <ReferenceLine x={data.median} stroke="#F43F5E" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-6 gap-2 mt-2 text-xs">
                    <div className="text-center">
                      <div className="text-gray-500">Min</div>
                      <div className="font-medium">{data.min.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Q1</div>
                      <div className="font-medium">{data.q1.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Median</div>
                      <div className="font-medium text-red-500">{data.median.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Q3</div>
                      <div className="font-medium">{data.q3.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Max</div>
                      <div className="font-medium">{data.max.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Mean</div>
                      <div className="font-medium">{data.mean.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const chartTypes: { type: ChartType; label: string }[] = [
    { type: 'bar', label: t('bar') },
    { type: 'line', label: t('line') },
    { type: 'pie', label: t('pie') },
    { type: 'scatter', label: t('scatter') },
    { type: 'histogram', label: t('histogram') },
    { type: 'boxPlot', label: t('boxPlot') },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>Visualize your data with interactive charts</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Chart Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label className="text-sm font-medium">{t('chartType') || 'Chart Type'}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {chartTypes.map(({ type, label }) => (
                <Button
                  key={type}
                  variant={chartType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType(type)}
                  className={chartType === type ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {chartType !== 'histogram' && chartType !== 'boxPlot' && (
            <div>
              <Label className="text-sm font-medium">{t('selectXAxis')}</Label>
              <select
                className="w-full mt-2 px-3 py-2 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={xAxis}
                onChange={e => setXAxis(e.target.value)}
              >
                {allColumns.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>
          )}

          {chartType !== 'boxPlot' && (
            <div>
              <Label className="text-sm font-medium">
                {chartType === 'histogram' ? (t('selectVariable') || 'Variable') : t('selectYAxis')}
              </Label>
              <select
                className="w-full mt-2 px-3 py-2 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={yAxis}
                onChange={e => setYAxis(e.target.value)}
              >
                {numericColumns.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>
          )}

          {(chartType === 'bar' || chartType === 'line') && (
            <div>
              <Label className="text-sm font-medium">{t('selectYAxis2') || 'Y-Axis 2 (Optional)'}</Label>
              <select
                className="w-full mt-2 px-3 py-2 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={yAxis2}
                onChange={e => setYAxis2(e.target.value)}
              >
                <option value="">None</option>
                {numericColumns.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>
          )}

          {chartType === 'histogram' && (
            <div>
              <Label className="text-sm font-medium">{t('bins')}</Label>
              <Input
                type="number"
                className="mt-2"
                value={bins}
                onChange={e => setBins(Math.max(2, Math.min(50, parseInt(e.target.value) || 10)))}
                min={2}
                max={50}
              />
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">{t('chartTitle') || 'Title (Optional)'}</Label>
            <Input
              className="mt-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('chartTitlePlaceholder') || 'Chart title'}
            />
          </div>
        </div>

        {/* Chart Display */}
        <div className="border rounded-lg p-4 bg-white">
          {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
          {chartData.length > 0 || histogramData.length > 0 || boxPlotData.length > 0 || scatterData.length > 0 ? (
            renderChart()
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data to display. Select columns with data.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}