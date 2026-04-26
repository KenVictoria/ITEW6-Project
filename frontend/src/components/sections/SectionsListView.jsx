// src/components/sections/SectionsListView.jsx
import { motion } from 'framer-motion'
import { Eye, Edit2, Trash2, Users, ChevronRight, ChevronLeft } from 'lucide-react'

export function SectionsListView({ sections, loading, onEdit, onDelete, onViewDetails, pagination, onPageChange, onPerPageChange }) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-white/60 bg-white/80 p-4 animate-pulse">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 w-48 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const getStatusBadge = (isFull, availableSlots) => {
        if (isFull) {
            return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Full</span>
        } else if (availableSlots <= 5) {
            return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">Limited</span>
        }
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Available</span>
    }

    const Pagination = () => {
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
                    Showing {startItem} to {endItem} of {total} sections
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={per_page}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                        className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
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
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        {getPageNumbers().map(page => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium ${
                                    page === current_page
                                        ? 'bg-ccs-orange text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(current_page + 1)}
                            disabled={current_page === last_page}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {sections.map((section, idx) => (
                <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ x: 4 }}
                    className="group rounded-2xl border border-white/60 bg-white/80 p-4 transition-all duration-200 hover:shadow-md"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                                    <span className="text-orange-600 font-semibold">
                                        {section.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-ccs-ink group-hover:text-ccs-orange">
                                        {section.name}
                                    </h3>
                                    <p className="text-xs text-gray-400">{section.course_code} - {section.course_name}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-medium">Year {section.year_level}</div>
                                <div className="text-xs text-gray-500">{section.semester} • {section.academic_year}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-gray-400" />
                                <span className="text-sm">{section.current_enrolled}/{section.max_capacity}</span>
                            </div>
                            {getStatusBadge(section.is_full, section.available_slots)}
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onViewDetails(section)}
                                    className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                                    title="View Details"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => onEdit(section)}
                                    className="rounded-lg p-1.5 text-green-600 hover:bg-green-50"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(section)}
                                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-ccs-orange" />
                        </div>
                    </div>
                </motion.div>
            ))}
            {sections.length === 0 && (
                <div className="py-12 text-center">
                    <p className="text-gray-400">No sections found</p>
                </div>
            )}
            <Pagination />
        </div>
    )
}