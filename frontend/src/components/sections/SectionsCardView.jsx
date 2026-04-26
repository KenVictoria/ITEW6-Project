// src/components/sections/SectionsCardView.jsx
import { motion } from 'framer-motion'
import { Eye, Edit2, Trash2, Users, BookOpen, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

export function SectionsCardView({ sections, loading, onEdit, onDelete, onViewDetails, pagination, onPageChange, onPerPageChange }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-white/60 bg-white/80 p-6 animate-pulse">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 w-full bg-gray-200 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const getStatusColor = (isFull, availableSlots) => {
        if (isFull) return 'bg-red-100 text-red-700'
        if (availableSlots <= 5) return 'bg-yellow-100 text-yellow-700'
        return 'bg-green-100 text-green-700'
    }

    const getStatusText = (isFull, availableSlots) => {
        if (isFull) return 'Full'
        if (availableSlots <= 5) return 'Limited Slots'
        return 'Available'
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sections.map((section, idx) => (
                    <motion.div
                        key={section.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-ccs-ink group-hover:text-ccs-orange">
                                    {section.name}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">{section.course_code}</p>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(section.is_full, section.available_slots)}`}>
                                {getStatusText(section.is_full, section.available_slots)}
                            </span>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <BookOpen size={14} className="text-ccs-orange" />
                                <span>{section.course_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={14} className="text-ccs-orange" />
                                <span>Year {section.year_level} • {section.semester} Sem • {section.academic_year}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Users size={14} className="text-ccs-orange" />
                                <span>{section.current_enrolled} / {section.max_capacity} students</span>
                            </div>
                        </div>
                        
                        <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => onViewDetails(section)}
                                className="flex-1 rounded-xl bg-blue-50 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                            >
                                View Details
                            </button>
                            <button
                                onClick={() => onEdit(section)}
                                className="rounded-xl bg-green-50 p-2 text-green-600 transition hover:bg-green-100"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(section)}
                                className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
            {sections.length === 0 && (
                <div className="py-12 text-center">
                    <p className="text-gray-400">No sections found</p>
                </div>
            )}
            <Pagination />
        </div>
    )
}