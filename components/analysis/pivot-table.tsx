'use client'

import { useState } from 'react'
import { Column, Row, AggregationType } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface PivotTableProps {
  columns: Column[]
  rows: Row[]
}

type PivotData = Record<string, Record<string, number>>

export function PivotTable({ columns, rows }: PivotTableProps) {
  const [rowField, setRowField] = useState<string>(columns[0]?.id || '')
  const [columnField, setColumnField] = useState<string>(columns[1]?.id || '')
  const [valueField, setValueField] = useState<string>(columns.find(c => c.type === 'number')?.id || '')
  const [aggregation, setAggregation] = useState<AggregationType>('sum')

  const numericColumns = columns.filter(c => c.type === 'number')

  // Calculate pivot data
  const calculatePivot = (): { pivotData: PivotData; rowValues: string[]; columnValues: string[] } => {
    const pivotData: PivotData = {}
    const rowValues = new Set<string>()
    const columnValues = new Set<string>()

    // Group data
    rows.forEach(row => {
      const rowVal = String(row[rowField] || '(empty)')
      const colVal = String(row[columnField] || '(empty)')
      const val = Number(row[valueField]) || 0

      rowValues.add(rowVal)
      columnValues.add(colVal)

      if (!pivotData[rowVal]) {
        pivotData[rowVal] = {}
      }
      if (!pivotData[rowVal][colVal]) {
        pivotData[rowVal][colVal] = 0
      }

      // For sum, accumulate; for count, increment; for avg, store sum and count
      if (aggregation === 'sum' || aggregation === 'avg') {
        pivotData[rowVal][colVal] += val
      } else if (aggregation === 'count') {
        pivotData[rowVal][colVal] += 1
      } else if (aggregation === 'min') {
        pivotData[rowVal][colVal] = pivotData[rowVal][colVal] === 0 ? val : Math.min(pivotData[rowVal][colVal], val)
      } else if (aggregation === 'max') {
        pivotData[rowVal][colVal] = Math.max(pivotData[rowVal][colVal], val)
      }
    })

    return {
      pivotData,
      rowValues: Array.from(rowValues).sort(),
      columnValues: Array.from(columnValues).sort(),
    }
  }

  const { pivotData, rowValues, columnValues } = calculatePivot()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pivot Table</CardTitle>
        <CardDescription>Summarize and analyze your data with pivot functionality</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label className="text-sm font-medium">Rows</Label>
            <select
              className="w-full mt-2 px-3 py-2 border rounded-md"
              value={rowField}
              onChange={e => setRowField(e.target.value)}
            >
              {columns.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Columns</Label>
            <select
              className="w-full mt-2 px-3 py-2 border rounded-md"
              value={columnField}
              onChange={e => setColumnField(e.target.value)}
            >
              {columns.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Values</Label>
            <select
              className="w-full mt-2 px-3 py-2 border rounded-md"
              value={valueField}
              onChange={e => setValueField(e.target.value)}
            >
              {numericColumns.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Aggregation</Label>
            <select
              className="w-full mt-2 px-3 py-2 border rounded-md"
              value={aggregation}
              onChange={e => setAggregation(e.target.value as AggregationType)}
            >
              <option value="sum">Sum</option>
              <option value="avg">Average</option>
              <option value="count">Count</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
            </select>
          </div>
        </div>

        {/* Pivot Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium border-b">
                  {columns.find(c => c.id === rowField)?.name}
                </th>
                {columnValues.map(colVal => (
                  <th key={colVal} className="px-4 py-2 text-right font-medium border-b">
                    {colVal}
                  </th>
                ))}
                <th className="px-4 py-2 text-right font-medium border-b bg-gray-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {rowValues.map(rowVal => {
                let rowTotal = 0
                return (
                  <tr key={rowVal} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{rowVal}</td>
                    {columnValues.map(colVal => {
                      const value = pivotData[rowVal]?.[colVal] || 0
                      rowTotal += value
                      return (
                        <td key={colVal} className="px-4 py-2 text-right">
                          {value.toFixed(2)}
                        </td>
                      )
                    })}
                    <td className="px-4 py-2 text-right font-medium bg-gray-50">
                      {rowTotal.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-4 py-2 font-medium">Total</td>
                {columnValues.map(colVal => {
                  let colTotal = 0
                  rowValues.forEach(rowVal => {
                    colTotal += pivotData[rowVal]?.[colVal] || 0
                  })
                  return (
                    <td key={colVal} className="px-4 py-2 text-right font-medium">
                      {colTotal.toFixed(2)}
                    </td>
                  )
                })}
                <td className="px-4 py-2 text-right font-bold bg-gray-100">
                  {Object.values(pivotData).reduce((sum, row) => {
                    return sum + Object.values(row).reduce((s, v) => s + v, 0)
                  }, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}