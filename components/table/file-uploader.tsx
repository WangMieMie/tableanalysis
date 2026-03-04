'use client'

import { useState, useCallback } from 'react'
import { useFileParser } from '@/hooks/use-file-parser'
import { Column, Row, FileParseResult } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'

interface FileUploaderProps {
  onDataLoaded: (result: FileParseResult) => void
}

export function FileUploader({ onDataLoaded }: FileUploaderProps) {
  const { parseFile, isParsing, error, progress } = useFileParser()
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    try {
      const result = await parseFile(file)
      onDataLoaded(result)
    } catch (err) {
      console.error('Failed to parse file:', err)
    }
  }, [parseFile, onDataLoaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Data
        </CardTitle>
        <CardDescription>
          Upload CSV or Excel files to analyze your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-gray-400 bg-gray-50' : 'border-gray-200'}
            ${isParsing ? 'opacity-50 pointer-events-none' : 'hover:border-gray-300'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isParsing}
          />

          {isParsing ? (
            <div className="space-y-3">
              <div className="animate-spin h-12 w-12 border-4 border-gray-200 border-t-gray-600 rounded-full mx-auto" />
              <p className="text-sm text-gray-600">Processing file...</p>
              {progress > 0 && (
                <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600">
                  Drag and drop your file here, or{' '}
                  <span className="text-gray-900 font-medium">browse</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}