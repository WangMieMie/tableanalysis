'use client'

import { useState, useCallback, useMemo } from 'react'
import { Column, Row, TableData, TableStatistics, ColumnStatistics } from '@/types'
import * as ss from 'simple-statistics'

interface UseTableDataReturn {
  tableData: TableData | null
  setTableData: React.Dispatch<React.SetStateAction<TableData | null>>
  columns: Column[]
  rows: Row[]
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>
  setRows: React.Dispatch<React.SetStateAction<Row[]>>
  updateCell: (rowId: string, columnId: string, value: string | number | boolean | null) => void
  addRow: () => void
  deleteRow: (rowId: string) => void
  addColumn: (name: string, type: Column['type']) => void
  deleteColumn: (columnId: string) => void
  renameColumn: (columnId: string, newName: string) => void
  changeColumnType: (columnId: string, newType: Column['type']) => void
  getStatistics: () => TableStatistics
  clearTable: () => void
}

export function useTableData(initialData?: TableData): UseTableDataReturn {
  const [tableData, setTableData] = useState<TableData | null>(initialData || null)

  const columns = useMemo(() => tableData?.columns || [], [tableData?.columns])
  const rows = useMemo(() => tableData?.rows || [], [tableData?.rows])

  const setColumns = useCallback((newColumns: React.SetStateAction<Column[]>) => {
    setTableData(prev => {
      if (!prev) return null
      const cols = typeof newColumns === 'function' ? newColumns(prev.columns) : newColumns
      return { ...prev, columns: cols, updatedAt: new Date() }
    })
  }, [])

  const setRows = useCallback((newRows: React.SetStateAction<Row[]>) => {
    setTableData(prev => {
      if (!prev) return null
      const r = typeof newRows === 'function' ? newRows(prev.rows) : newRows
      return { ...prev, rows: r, updatedAt: new Date() }
    })
  }, [])

  const updateCell = useCallback((rowId: string, columnId: string, value: string | number | boolean | null) => {
    setTableData(prev => {
      if (!prev) return null
      return {
        ...prev,
        rows: prev.rows.map(row =>
          row.id === rowId ? { ...row, [columnId]: value } : row
        ),
        updatedAt: new Date(),
      }
    })
  }, [])

  const addRow = useCallback(() => {
    setTableData(prev => {
      if (!prev) return null
      const newRow: Row = {
        id: `row-${Date.now()}`,
        ...Object.fromEntries(prev.columns.map(col => [col.id, null])),
      }
      return {
        ...prev,
        rows: [...prev.rows, newRow],
        updatedAt: new Date(),
      }
    })
  }, [])

  const deleteRow = useCallback((rowId: string) => {
    setTableData(prev => {
      if (!prev) return null
      return {
        ...prev,
        rows: prev.rows.filter(row => row.id !== rowId),
        updatedAt: new Date(),
      }
    })
  }, [])

  const addColumn = useCallback((name: string, type: Column['type']) => {
    setTableData(prev => {
      if (!prev) return null
      const newColumn: Column = {
        id: `col-${Date.now()}`,
        name,
        type,
      }
      return {
        ...prev,
        columns: [...prev.columns, newColumn],
        rows: prev.rows.map(row => ({ ...row, [newColumn.id]: null })),
        updatedAt: new Date(),
      }
    })
  }, [])

  const deleteColumn = useCallback((columnId: string) => {
    setTableData(prev => {
      if (!prev) return null
      return {
        ...prev,
        columns: prev.columns.filter(col => col.id !== columnId),
        rows: prev.rows.map(row => {
          const newRow = { ...row }
          delete newRow[columnId]
          return newRow
        }),
        updatedAt: new Date(),
      }
    })
  }, [])

  const renameColumn = useCallback((columnId: string, newName: string) => {
    setTableData(prev => {
      if (!prev) return null
      return {
        ...prev,
        columns: prev.columns.map(col =>
          col.id === columnId ? { ...col, name: newName } : col
        ),
        updatedAt: new Date(),
      }
    })
  }, [])

  const changeColumnType = useCallback((columnId: string, newType: Column['type']) => {
    setTableData(prev => {
      if (!prev) return null
      return {
        ...prev,
        columns: prev.columns.map(col =>
          col.id === columnId ? { ...col, type: newType } : col
        ),
        updatedAt: new Date(),
      }
    })
  }, [])

  const getStatistics = useCallback((): TableStatistics => {
    const stats: TableStatistics = {}

    columns.forEach(column => {
      const values = rows
        .map(row => row[column.id])
        .filter(v => v !== null && v !== undefined && v !== '')

      const numericValues = values
        .filter((v): v is number => typeof v === 'number' || !isNaN(Number(v)))
        .map(v => typeof v === 'number' ? v : Number(v))

      const columnStats: ColumnStatistics = {
        count: values.length,
        nullCount: rows.length - values.length,
        uniqueCount: new Set(values).size,
      }

      if (column.type === 'number' && numericValues.length > 0) {
        columnStats.sum = ss.sum(numericValues)
        columnStats.average = ss.mean(numericValues)
        columnStats.min = ss.min(numericValues)
        columnStats.max = ss.max(numericValues)
        columnStats.median = ss.median(numericValues)
        columnStats.stdDev = ss.standardDeviation(numericValues)
      }

      stats[column.name] = columnStats
    })

    return stats
  }, [columns, rows])

  const clearTable = useCallback(() => {
    setTableData(null)
  }, [])

  return {
    tableData,
    setTableData,
    columns,
    rows,
    setColumns,
    setRows,
    updateCell,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    renameColumn,
    changeColumnType,
    getStatistics,
    clearTable,
  }
}