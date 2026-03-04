import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Column, Row } from '@/types'

interface ExportOptions {
  filename?: string
  sheetName?: string
}

/**
 * Convert table data to a format suitable for export
 */
function prepareDataForExport(columns: Column[], rows: Row[]): Record<string, unknown>[] {
  return rows.map(row => {
    const obj: Record<string, unknown> = {}
    columns.forEach(col => {
      obj[col.name] = row[col.id]
    })
    return obj
  })
}

/**
 * Export data to CSV format
 */
export function exportToCSV(columns: Column[], rows: Row[], options: ExportOptions = {}) {
  const data = prepareDataForExport(columns, rows)

  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Create worksheet from JSON data
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Data')

  // Generate CSV content
  const csvContent = XLSX.utils.sheet_to_csv(worksheet)

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const filename = options.filename || `export-${new Date().toISOString().slice(0, 10)}.csv`
  saveAs(blob, filename)
}

/**
 * Export data to Excel format (.xlsx)
 */
export function exportToExcel(columns: Column[], rows: Row[], options: ExportOptions = {}) {
  const data = prepareDataForExport(columns, rows)

  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Create worksheet from JSON data
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Auto-size columns
  const colWidths = columns.map(col => ({
    wch: Math.max(col.name.length, ...rows.map(row => {
      const value = row[col.id]
      return value ? String(value).length : 0
    }))
  }))
  worksheet['!cols'] = colWidths

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Data')

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

  // Create and download file
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const filename = options.filename || `export-${new Date().toISOString().slice(0, 10)}.xlsx`
  saveAs(blob, filename)
}

/**
 * Export data based on format
 */
export function exportData(columns: Column[], rows: Row[], format: 'csv' | 'excel', options: ExportOptions = {}) {
  if (format === 'csv') {
    exportToCSV(columns, rows, options)
  } else {
    exportToExcel(columns, rows, options)
  }
}