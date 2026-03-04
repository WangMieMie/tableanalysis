'use client'

import { useState } from 'react'
import { Column, Row, ChartType } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface ChartBuilderProps {
  columns: Column[]
  rows: Row[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export function ChartBuilder({ columns, rows }: ChartBuilderProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [xAxis, setXAxis] = useState<string>(columns[0]?.id || '')
  const [yAxis, setYAxis] = useState<string>(columns.find(c => c.type === 'number')?.id || '')
  const [title, setTitle] = useState<string>('')

  const numericColumns = columns.filter(c => c.type === 'number')

  // Prepare chart data
  const chartData = rows.map(row => ({
    name: String(row[xAxis] || ''),
    value: Number(row[yAxis]) || 0,
  })).slice(0, 50) // Limit to 50 data points for performance

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name={columns.find(c => c.id === yAxis)?.name || 'Value'} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                name={columns.find(c => c.id === yAxis)?.name || 'Value'}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8b5cf6" name={columns.find(c => c.id === yAxis)?.name || 'Value'} />
            </BarChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charts</CardTitle>
        <CardDescription>Visualize your data with interactive charts</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Chart Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label className="text-sm font-medium">Chart Type</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(['bar', 'line', 'pie'] as ChartType[]).map(type => (
                <Button
                  key={type}
                  variant={chartType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">X-Axis</Label>
            <select
              className="w-full mt-2 px-3 py-2 border rounded-md"
              value={xAxis}
              onChange={e => setXAxis(e.target.value)}
            >
              {columns.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Y-Axis</Label>
            <select
              className="w-full mt-2 px-3 py-2 border rounded-md"
              value={yAxis}
              onChange={e => setYAxis(e.target.value)}
            >
              {numericColumns.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Title (Optional)</Label>
            <Input
              className="mt-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Chart title"
            />
          </div>
        </div>

        {/* Chart Display */}
        <div className="border rounded-lg p-4 bg-white">
          {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
          {chartData.length > 0 ? renderChart() : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data to display. Select columns with data.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}