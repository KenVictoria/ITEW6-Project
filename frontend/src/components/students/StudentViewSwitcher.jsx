// src/components/students/StudentViewSwitcher.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, Table as TableIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import StudentCardView from './StudentCardView'
import StudentListView from './StudentListView'
import StudentTableView from './StudentTableView'

const VIEWS = {
  CARD: 'card',
  LIST: 'list',
  TABLE: 'table'
}

export function StudentViewSwitcher({ students, loading, onEdit, onDelete, canEdit, canDelete, pagination, onPageChange, onPerPageChange }) {
  const [currentView, setCurrentView] = useState(VIEWS.TABLE)

  const renderView = () => {
    const commonProps = {
      students,
      loading,
      onEdit,
      onDelete,
      canEdit,
      canDelete
    }
    
    switch (currentView) {
      case VIEWS.CARD:
        return <StudentCardView {...commonProps} />
      case VIEWS.LIST:
        return <StudentListView {...commonProps} />
      case VIEWS.TABLE:
        return <StudentTableView {...commonProps} />
      default:
        return <StudentTableView {...commonProps} />
    }
  }

  // Pagination component
  const PaginationControls = () => {
    if (!pagination || pagination.total === 0) return null
    
    const { current_page, last_page, per_page, total } = pagination
    const startItem = (current_page - 1) * per_page + 1
    const endItem = Math.min(current_page * per_page, total)
    
    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, current_page - Math.floor(maxVisible / 2))
      let end = Math.min(last_page, start + maxVisible - 1)
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
    
    return (
      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{startItem}</span> to{' '}
          <span className="font-medium text-gray-700">{endItem}</span> of{' '}
          <span className="font-medium text-gray-700">{total}</span> students
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={per_page}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-orange-400 focus:outline-none"
          >
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(current_page - 1)}
              disabled={current_page === 1}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
                  page === current_page
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(current_page + 1)}
              disabled={current_page === last_page}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Switcher Buttons */}
      <div className="flex justify-end">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {Object.entries(VIEWS).map(([key, value]) => (
            <button
              key={value}
              onClick={() => setCurrentView(value)}
              className={`rounded-lg p-2 transition-all duration-200 ${
                currentView === value 
                  ? 'bg-white text-orange-500 shadow-sm' 
                  : 'text-gray-500 hover:text-orange-500'
              }`}
            >
              {value === VIEWS.CARD && <LayoutGrid size={18} />}
              {value === VIEWS.LIST && <List size={18} />}
              {value === VIEWS.TABLE && <TableIcon size={18} />}
            </button>
          ))}
        </div>
      </div>
      
      {/* View Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      
      {/* Pagination */}
      <PaginationControls />
    </div>
  )
}