'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react'
import { Column, Row } from '@/types'
import { exportToCSV, exportToExcel } from '@/lib/export'

interface ExportButtonProps {
  columns: Column[]
  rows: Row[]
  filename?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  disabled?: boolean
}

export function ExportButton({
  columns,
  rows,
  filename,
  variant = 'outline',
  size = 'sm',
  disabled = false,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleExport = (format: 'csv' | 'excel') => {
    const options = filename ? { filename } : undefined

    if (format === 'csv') {
      exportToCSV(columns, rows, options)
    } else {
      exportToExcel(columns, rows, options)
    }

    setIsOpen(false)
  }

  if (rows.length === 0 || columns.length === 0) {
    return (
      <Button variant={variant} size={size} disabled>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    )
  }

  return (
    <div className="relative">
      <div className="flex">
        <Button
          variant={variant}
          size={size}
          onClick={() => handleExport('excel')}
          disabled={disabled}
          className="rounded-r-none"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button
          variant={variant}
          size={size}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="rounded-l-none border-l-0 px-2"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleExport('excel')}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Excel (.xlsx)
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleExport('csv')}
              >
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                CSV (.csv)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}