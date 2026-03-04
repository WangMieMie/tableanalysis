'use client'

import { useState, useCallback, useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Column, Row, FileParseResult } from '@/types'

interface UseFileParserReturn {
  parseFile: (file: File) => Promise<FileParseResult>
  isParsing: boolean
  error: string | null
  progress: number
}

export function useFileParser(): UseFileParserReturn {
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const detectColumnType = (values: (string | number | boolean | null)[]): Column['type'] => {
    const nonNullValues = values.filter(v => v !== null && v !== '')

    if (nonNullValues.length === 0) return 'text'

    // Check if all values are numbers
    const allNumbers = nonNullValues.every(v => {
      if (typeof v === 'number') return true
      if (typeof v === 'string') {
        const num = Number(v)
        return !isNaN(num) && isFinite(num)
      }
      return false
    })
    if (allNumbers) return 'number'

    // Check if all values are dates
    const allDates = nonNullValues.every(v => {
      if (typeof v !== 'string') return false
      const date = new Date(v)
      return !isNaN(date.getTime())
    })
    if (allDates) return 'date'

    // Check if all values are booleans
    const boolValues = ['true', 'false', 'yes', 'no', '1', '0']
    const allBooleans = nonNullValues.every(v => {
      if (typeof v === 'boolean') return true
      if (typeof v === 'string') return boolValues.includes(v.toLowerCase())
      return false
    })
    if (allBooleans) return 'boolean'

    return 'text'
  }

  const parseCSV = async (file: File): Promise<FileParseResult> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(results.errors[0].message))
            return
          }

          const data = results.data as Record<string, string>[]
          const headers = results.meta.fields || []

          // Create columns with type detection
          const columns: Column[] = headers.map((header, index) => {
            const values = data.map(row => row[header])
            return {
              id: `col-${index}`,
              name: header,
              type: detectColumnType(values),
            }
          })

          // Create rows with IDs
          const rows: Row[] = data.map((row, index) => ({
            id: `row-${index}`,
            ...Object.fromEntries(
              headers.map((header, colIndex) => [
                columns[colIndex].id,
                row[header] === '' ? null : row[header]
              ])
            ),
          }))

          resolve({ columns, rows })
        },
        error: (err) => {
          reject(new Error(err.message))
        },
      })
    })
  }

  const parseExcel = async (file: File): Promise<FileParseResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as (string | number | boolean | null)[][]

          if (jsonData.length === 0) {
            reject(new Error('Empty Excel file'))
            return
          }

          const headers = jsonData[0] as string[]
          const dataRows = jsonData.slice(1)

          // Create columns with type detection
          const columns: Column[] = headers.map((header, index) => {
            const values = dataRows.map(row => row[index])
            return {
              id: `col-${index}`,
              name: String(header || `Column ${index + 1}`),
              type: detectColumnType(values),
            }
          })

          // Create rows with IDs
          const rows: Row[] = dataRows.map((row, index) => ({
            id: `row-${index}`,
            ...Object.fromEntries(
              columns.map((col, colIndex) => [
                col.id,
                row[colIndex] === undefined || row[colIndex] === '' ? null : row[colIndex]
              ])
            ),
          }))

          resolve({ columns, rows })
        } catch (err) {
          reject(err)
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  const parseFile = useCallback(async (file: File): Promise<FileParseResult> => {
    setIsParsing(true)
    setError(null)
    setProgress(0)

    try {
      const extension = file.name.split('.').pop()?.toLowerCase()

      let result: FileParseResult

      if (extension === 'csv') {
        result = await parseCSV(file)
      } else if (extension === 'xlsx' || extension === 'xls') {
        result = await parseExcel(file)
      } else {
        throw new Error(`Unsupported file format: ${extension}`)
      }

      setProgress(100)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setIsParsing(false)
    }
  }, [])

  return { parseFile, isParsing, error, progress }
}