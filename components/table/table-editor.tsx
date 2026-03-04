'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  Column as TanStackColumn,
} from '@tanstack/react-table'
import { Column, Row } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Trash2 } from 'lucide-react'

interface TableEditorProps {
  columns: Column[]
  rows: Row[]
  onCellEdit: (rowId: string, columnId: string, value: string | number | boolean | null) => void
  onDeleteRow: (rowId: string) => void
  onDeleteColumn: (columnId: string) => void
}

export function TableEditor({ columns, rows, onCellEdit, onDeleteRow, onDeleteColumn }: TableEditorProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Convert our column format to TanStack Table format
  const tableColumns: ColumnDef<Row>[] = [
    ...columns.map(col => ({
      accessorKey: col.id,
      header: ({ column }: { column: TanStackColumn<Row, unknown> }) => (
        <div className="flex items-center justify-between group">
          <button
            className="flex items-center font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {col.name}
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
            onClick={() => onDeleteColumn(col.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ getValue, row }: { getValue: () => unknown; row: { original: Row } }) => {
        const value = getValue()
        return (
          <Input
            className="border-0 bg-transparent hover:bg-gray-50 focus:bg-gray-50 px-2"
            value={String(value ?? '')}
            onChange={(e) => {
              let newValue: string | number | boolean | null = e.target.value
              if (col.type === 'number' && newValue !== '') {
                newValue = Number(newValue)
              } else if (col.type === 'boolean') {
                newValue = newValue === 'true'
              }
              onCellEdit(row.original.id, col.id, newValue || null)
            }}
          />
        )
      },
    })),
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: { original: Row } }) => (
        <button
          className="text-gray-400 hover:text-red-500"
          onClick={() => onDeleteRow(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ]

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  return (
    <div className="w-full">
      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-gray-500">
          {rows.length} rows
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-medium text-gray-900"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-2 py-1">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}