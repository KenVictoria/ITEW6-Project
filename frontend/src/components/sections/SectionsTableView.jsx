// src/components/sections/SectionsTableView.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { Eye, Edit2, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react'

export function SectionsTableView({ sections, loading, onEdit, onDelete, onViewDetails, pagination, onPageChange, onPerPageChange }) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-8">
                <div className="flex justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-ccs-orange border-t-transparent" />
                </div>
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
        <div className="rounded-2xl border border-white/60 bg-white/80 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-gray-100 bg-gray-50">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Section Name</th>
                            <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Course</th>
                            <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Year Level</th>
                            <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Semester</th>
                            <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Academic Year</th>
                            <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Enrollment</th>
                            <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Status</th>
                            <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.map((section, idx) => (
                            <motion.tr
                                key={section.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="border-b border-gray-100 hover:bg-orange-50/30"
                            >
                                <td className="p-4 font-medium text-ccs-ink">{section.name}</td>
                                <td className="p-4">
                                    <div>
                                        <div className="font-medium">{section.course_code}</div>
                                        <div className="text-xs text-gray-500">{section.course_name}</div>
                                    </div>
                                </td>
                                <td className="p-4">Year {section.year_level}</td>
                                <td className="p-4">{section.semester}</td>
                                <td className="p-4">{section.academic_year}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-gray-400" />
                                        <span>{section.current_enrolled} / {section.max_capacity}</span>
                                    </div>
                                </td>
                                <td className="p-4">{getStatusBadge(section.is_full, section.available_slots)}</td>
                                <td className="p-4">
                                    <div className="flex gap-2">
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
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
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