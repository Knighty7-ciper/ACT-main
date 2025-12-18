"use client"

import React, { useState, useEffect } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react'
import TouchButton from './touch-button'

interface Column {
  id: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => string
  render?: (value: any, row: any) => React.ReactNode
}

interface Action {
  id: string
  label: string
  icon: React.ComponentType<any>
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  onClick: (row: any) => void
  show?: (row: any) => boolean
  requireConfirmation?: boolean
}

interface ResponsiveTableProps {
  data: any[]
  columns: Column[]
  actions?: Action[]
  loading?: boolean
  emptyMessage?: string
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  mobileView?: 'cards' | 'list' | 'compact'
  className?: string
  onSelectionChange?: (selectedIds: string[]) => void
  onRefresh?: () => void
}

export default function ResponsiveTable({
  data = [],
  columns = [],
  actions = [],
  loading = false,
  emptyMessage = 'No data available',
  searchable = true,
  filterable = false,
  sortable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  mobileView = 'cards',
  className = '',
  onSelectionChange,
  onRefresh
}: ResponsiveTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileActions, setShowMobileActions] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle selection
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedIds)
    }
  }, [selectedIds, onSelectionChange])

  // Filter and sort data
  const filteredData = data.filter(row => {
    if (!searchTerm) return true
    
    return columns.some(column => {
      const value = row[column.id]
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData

  const handleSort = (columnId: string) => {
    if (!sortable) return
    
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnId)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedData.map(row => row.id?.toString() || Math.random().toString()))
    }
  }

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }

  const handleActionClick = (action: Action, row: any) => {
    if (action.requireConfirmation) {
      const confirmed = window.confirm(`Are you sure you want to ${action.label.toLowerCase()}?`)
      if (!confirmed) return
    }
    action.onClick(row)
    setShowMobileActions(null)
  }

  // Format cell value
  const formatCellValue = (column: Column, value: any) => {
    if (column.render) {
      return column.render(value, data.find(row => row[column.id] === value))
    }
    
    if (column.format) {
      return column.format(value)
    }
    
    return value
  }

  // Mobile Card View
  const renderMobileCard = (row: any) => {
    const rowId = row.id?.toString() || Math.random().toString()
    const isSelected = selectedIds.includes(rowId)
    
    return (
      <div
        key={rowId}
        className={`bg-white/5 border border-white/10 rounded-xl p-4 mb-4 transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-500/10' : 'hover:bg-white/10'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {selectable && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSelectRow(rowId)}
                className="w-4 h-4 text-blue-500 bg-transparent border-gray-400 rounded focus:ring-blue-500"
              />
            )}
            <h3 className="text-white font-medium">
              {row[columns[0]?.id] || 'Untitled'}
            </h3>
          </div>
          
          {actions.length > 0 && (
            <div className="relative">
              <TouchButton
                variant="secondary"
                size="sm"
                onClick={() => setShowMobileActions(showMobileActions === rowId ? null : rowId)}
                icon={MoreVertical}
                className="p-2"
              />
              
              {showMobileActions === rowId && (
                <div className="absolute right-0 top-full mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl z-10 min-w-[150px]">
                  {actions
                    .filter(action => !action.show || action.show(row))
                    .map(action => {
                      const Icon = action.icon
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action, row)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                            action.variant === 'danger' ? 'text-red-400' : 'text-gray-300'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{action.label}</span>
                        </button>
                      )
                    })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="space-y-3">
          {columns.slice(1).map(column => (
            <div key={column.id} className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{column.label}:</span>
              <span className="text-white text-sm font-medium">
                {formatCellValue(column, row[column.id])}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Desktop Table View
  const renderDesktopTable = () => (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/20">
            <tr>
              {selectable && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-500 bg-transparent border-gray-400 rounded focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.id}
                  className={`px-4 py-3 text-left text-sm font-medium text-gray-300 ${
                    column.sortable && sortable ? 'cursor-pointer hover:text-white' : ''
                  } ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`h-3 w-3 ${
                            sortColumn === column.id && sortDirection === 'asc' 
                              ? 'text-white' : 'text-gray-500'
                          }`} 
                        />
                        <ChevronDown 
                          className={`h-3 w-3 -mt-1 ${
                            sortColumn === column.id && sortDirection === 'desc' 
                              ? 'text-white' : 'text-gray-500'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const rowId = row.id?.toString() || index.toString()
              const isSelected = selectedIds.includes(rowId)
              
              return (
                <tr
                  key={rowId}
                  className={`border-t border-white/10 transition-colors ${
                    isSelected ? 'bg-blue-500/10' : 'hover:bg-white/5'
                  }`}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                        className="w-4 h-4 text-blue-500 bg-transparent border-gray-400 rounded focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td
                      key={column.id}
                      className={`px-4 py-3 text-sm ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {formatCellValue(column, row[column.id])}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        {actions
                          .filter(action => !action.show || action.show(row))
                          .map(action => {
                            const Icon = action.icon
                            return (
                              <TouchButton
                                key={action.id}
                                variant={action.variant || 'secondary'}
                                size="sm"
                                onClick={() => handleActionClick(action, row)}
                                icon={Icon}
                                className="p-2"
                              >
                                <span className="sr-only">{action.label}</span>
                              </TouchButton>
                            )
                          })}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Controls */}
      {(searchable || filterable || onRefresh) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div className="flex space-x-2">
            {filterable && (
              <TouchButton variant="secondary" icon={Filter}>
                Filter
              </TouchButton>
            )}
            
            {onRefresh && (
              <TouchButton 
                variant="secondary" 
                icon={RefreshCw}
                onClick={onRefresh}
              >
                Refresh
              </TouchButton>
            )}
          </div>
        </div>
      )}

      {/* Table Content */}
      {paginatedData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      ) : isMobile && mobileView === 'cards' ? (
        <div>
          {paginatedData.map(renderMobileCard)}
        </div>
      ) : (
        renderDesktopTable()
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </p>
          
          <div className="flex items-center space-x-2">
            <TouchButton
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </TouchButton>
            
            <span className="text-gray-400 text-sm">
              {currentPage} of {totalPages}
            </span>
            
            <TouchButton
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </TouchButton>
          </div>
        </div>
      )}
    </div>
  )
}