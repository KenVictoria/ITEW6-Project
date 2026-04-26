// src/components/sections/SectionDetailsModal.jsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, BookOpen, Calendar, UserPlus, UserMinus, Search, ChevronLeft, ChevronRight, Loader2, AlertCircle, Trash2, AlertTriangle } from 'lucide-react'
import { sectionService } from '../../services/sectionService'
import { api } from '../../lib/axios'
import { toast } from 'react-hot-toast'

export function SectionDetailsModal({ isOpen, onClose, section, onRefresh }) {
    const [availableStudents, setAvailableStudents] = useState([])
    const [enrolledStudents, setEnrolledStudents] = useState([])
    const [selectedStudents, setSelectedStudents] = useState([])
    const [loading, setLoading] = useState(false)
    const [addingStudents, setAddingStudents] = useState(false)
    const [studentSearchTerm, setStudentSearchTerm] = useState('')
    const [error, setError] = useState(null)
    
    // Remove confirmation modal state
    const [removeModalOpen, setRemoveModalOpen] = useState(false)
    const [studentToRemove, setStudentToRemove] = useState(null)
    const [isRemoving, setIsRemoving] = useState(false)
    
    // Pagination for available students
    const [availablePagination, setAvailablePagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    })
    const [loadingAvailable, setLoadingAvailable] = useState(false)
    
    // Track which students are being removed
    const [removingStudentId, setRemovingStudentId] = useState(null)

    // Fetch available students with search and pagination
    const fetchAvailableStudents = useCallback(async (page = 1) => {
        setLoadingAvailable(true)
        setError(null)
        try {
            const params = {
                page: page,
                per_page: availablePagination.per_page,
                search: studentSearchTerm,
            }
            
            // Remove empty params
            Object.keys(params).forEach(key => {
                if (!params[key] && params[key] !== 0) delete params[key]
            })
            
            const response = await api.get('/students', { params })
            const studentsData = response.data.data || response.data || []
            
            // Filter out students already in this section
            const enrolledIds = new Set(enrolledStudents.map(s => s.id))
            const filteredStudents = studentsData.filter(s => !enrolledIds.has(s.id))
            
            setAvailableStudents(filteredStudents)
            setAvailablePagination({
                current_page: response.data.current_page || 1,
                last_page: response.data.last_page || 1,
                per_page: response.data.per_page || 10,
                total: response.data.total || 0
            })
        } catch (error) {
            console.error('Failed to fetch students:', error)
            setError('Failed to load students. Please try again.')
            setAvailableStudents([])
        } finally {
            setLoadingAvailable(false)
        }
    }, [studentSearchTerm, availablePagination.per_page, enrolledStudents])

    // Fetch enrolled students for this section
    const fetchEnrolledStudents = useCallback(async () => {
        if (!section?.id) return
        
        setLoading(true)
        try {
            const response = await sectionService.getById(section.id)
            setEnrolledStudents(response.data.students || [])
        } catch (error) {
            console.error('Failed to fetch enrolled students:', error)
            toast.error('Failed to load enrolled students')
        } finally {
            setLoading(false)
        }
    }, [section?.id])

    // Load data when modal opens
    useEffect(() => {
        if (section && isOpen) {
            fetchEnrolledStudents()
        }
    }, [section, isOpen, fetchEnrolledStudents])

    // Fetch available students when enrolledStudents changes
    useEffect(() => {
        if (isOpen && section?.id) {
            fetchAvailableStudents(1)
        }
    }, [enrolledStudents, isOpen, section?.id, fetchAvailableStudents])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen) {
                fetchAvailableStudents(1)
            }
        }, 500)
        
        return () => clearTimeout(timer)
    }, [studentSearchTerm, fetchAvailableStudents, isOpen])

    // Reset selected students when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedStudents([])
            setStudentSearchTerm('')
            setError(null)
            setRemoveModalOpen(false)
            setStudentToRemove(null)
        }
    }, [isOpen])

    const handleAddStudents = async () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select students to add')
            return
        }
        
        // Check if any selected student is already enrolled (double-check)
        const enrolledIds = new Set(enrolledStudents.map(s => s.id))
        const alreadyEnrolled = selectedStudents.filter(id => enrolledIds.has(parseInt(id)))
        
        if (alreadyEnrolled.length > 0) {
            toast.error(`${alreadyEnrolled.length} selected student(s) are already enrolled in this section`)
            // Remove already enrolled students from selection
            const validSelections = selectedStudents.filter(id => !enrolledIds.has(parseInt(id)))
            setSelectedStudents(validSelections)
            if (validSelections.length === 0) return
        }
        
        // Check capacity
        const newTotal = enrolledStudents.length + selectedStudents.length
        if (newTotal > section.max_capacity) {
            const availableSlots = section.max_capacity - enrolledStudents.length
            toast.error(`Cannot add ${selectedStudents.length} student(s). Only ${availableSlots} slot(s) available.`)
            return
        }
        
        setAddingStudents(true)
        setError(null)
        
        try {
            await sectionService.addStudents(section.id, selectedStudents)
            toast.success(`${selectedStudents.length} student(s) added successfully`)
            setSelectedStudents([])
            setStudentSearchTerm('')
            
            // Refresh all data
            await fetchEnrolledStudents()
            await fetchAvailableStudents(1)
            
            // Notify parent to refresh sections list
            if (onRefresh) {
                await onRefresh()
            }
        } catch (error) {
            console.error('Add students error:', error)
            const errorMessage = error.response?.data?.message || 'Failed to add students'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setAddingStudents(false)
        }
    }
    
    const handleRemoveStudent = (studentId, studentName) => {
        // Open confirmation modal instead of direct confirm
        setStudentToRemove({ id: studentId, name: studentName })
        setRemoveModalOpen(true)
    }
    
    const confirmRemoveStudent = async () => {
        if (!studentToRemove) return
        
        setIsRemoving(true)
        setRemovingStudentId(studentToRemove.id)
        
        try {
            await sectionService.removeStudent(section.id, studentToRemove.id)
            toast.success(`"${studentToRemove.name}" has been removed from this section`)
            
            // Refresh all data
            await fetchEnrolledStudents()
            await fetchAvailableStudents(1)
            
            // Notify parent to refresh sections list
            if (onRefresh) {
                await onRefresh()
            }
            
            // Close the confirmation modal
            setRemoveModalOpen(false)
            setStudentToRemove(null)
        } catch (error) {
            console.error('Remove student error:', error)
            toast.error(error.response?.data?.message || 'Failed to remove student')
        } finally {
            setIsRemoving(false)
            setRemovingStudentId(null)
        }
    }

    const handleAvailablePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= availablePagination.last_page) {
            fetchAvailableStudents(newPage)
        }
    }

    const handleSelectAll = () => {
        if (selectedStudents.length === availableStudents.length) {
            setSelectedStudents([])
        } else {
            setSelectedStudents(availableStudents.map(s => s.id.toString()))
        }
    }

    // Clear selection when search changes
    const handleSearchChange = (e) => {
        setStudentSearchTerm(e.target.value)
        setSelectedStudents([]) // Clear selection when searching
    }

    if (!isOpen || !section) return null

    const Pagination = ({ current_page, last_page, onPageChange }) => {
        if (last_page <= 1) return null
        
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
            <div className="flex items-center justify-center gap-1 mt-4">
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
        )
    }

    const availableSlots = section.max_capacity - enrolledStudents.length
    const isFull = availableSlots <= 0

    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50"
                    onClick={onClose}
                />
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
                >
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-4">
                        <div>
                            <h2 className="text-xl font-bold text-ccs-ink">{section.name}</h2>
                            <p className="text-sm text-gray-500">{section.course_code} - {section.course_name}</p>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Section Info Cards */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="rounded-xl bg-orange-50 p-3">
                                <div className="flex items-center gap-2 text-orange-600">
                                    <Calendar size={16} />
                                    <span className="text-sm font-medium">Year Level</span>
                                </div>
                                <p className="mt-1 text-lg font-semibold">Year {section.year_level}</p>
                            </div>
                            <div className="rounded-xl bg-blue-50 p-3">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <BookOpen size={16} />
                                    <span className="text-sm font-medium">Semester</span>
                                </div>
                                <p className="mt-1 text-lg font-semibold">{section.semester}</p>
                            </div>
                            <div className="rounded-xl bg-green-50 p-3">
                                <div className="flex items-center gap-2 text-green-600">
                                    <Users size={16} />
                                    <span className="text-sm font-medium">Enrollment</span>
                                </div>
                                <p className="mt-1 text-lg font-semibold">
                                    {enrolledStudents.length} / {section.max_capacity}
                                    {availableSlots > 0 && (
                                        <span className="ml-2 text-xs text-green-600">({availableSlots} slots left)</span>
                                    )}
                                    {isFull && (
                                        <span className="ml-2 text-xs text-red-600">(Full)</span>
                                    )}
                                </p>
                            </div>
                            <div className="rounded-xl bg-purple-50 p-3">
                                <div className="flex items-center gap-2 text-purple-600">
                                    <Calendar size={16} />
                                    <span className="text-sm font-medium">Academic Year</span>
                                </div>
                                <p className="mt-1 text-lg font-semibold">{section.academic_year}</p>
                            </div>
                        </div>
                        
                        {/* Error Display */}
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertCircle size={16} />
                                    <span className="font-medium">Error</span>
                                </div>
                                <p className="mt-1 text-sm text-red-600">{error}</p>
                            </div>
                        )}
                        
                        {/* Available Students Section */}
                        <div className="rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-ccs-ink">Add Students to Section</h3>
                                {isFull && (
                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                        Section is Full
                                    </span>
                                )}
                            </div>
                            
                            {/* Search Bar */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search students by name, ID, or email..."
                                    value={studentSearchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 focus:border-ccs-orange focus:outline-none"
                                    disabled={isFull}
                                />
                            </div>
                            
                            {/* Select All Button */}
                            {availableStudents.length > 0 && !isFull && (
                                <div className="mb-2 flex justify-end">
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-sm text-ccs-orange hover:underline"
                                    >
                                        {selectedStudents.length === availableStudents.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            )}
                            
                            {/* Students List */}
                            <div className="max-h-64 overflow-y-auto border rounded-lg">
                                {loadingAvailable ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-ccs-orange" />
                                    </div>
                                ) : availableStudents.length > 0 ? (
                                    <div className="space-y-1">
                                        {availableStudents.map(student => (
                                            <label
                                                key={student.id}
                                                className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={student.id}
                                                    checked={selectedStudents.includes(student.id.toString())}
                                                    onChange={(e) => {
                                                        if (isFull) return
                                                        if (e.target.checked) {
                                                            setSelectedStudents([...selectedStudents, student.id.toString()])
                                                        } else {
                                                            setSelectedStudents(selectedStudents.filter(id => id !== student.id.toString()))
                                                        }
                                                    }}
                                                    disabled={isFull}
                                                    className="rounded border-gray-300 text-ccs-orange focus:ring-ccs-orange"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-ccs-ink">{student.name}</p>
                                                    <p className="text-xs text-gray-500">{student.student_id} • {student.email}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-400">
                                        {studentSearchTerm ? 'No students found matching your search' : 'No available students to add'}
                                    </div>
                                )}
                            </div>
                            
                            {/* Pagination */}
                            {!isFull && availableStudents.length > 0 && (
                                <Pagination 
                                    current_page={availablePagination.current_page}
                                    last_page={availablePagination.last_page}
                                    onPageChange={handleAvailablePageChange}
                                />
                            )}
                            
                            {/* Add Button */}
                            {!isFull && (
                                <button
                                    onClick={handleAddStudents}
                                    disabled={addingStudents || selectedStudents.length === 0}
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ccs-orange px-4 py-2 text-white hover:bg-ccs-orange-dark disabled:opacity-50"
                                >
                                    <UserPlus size={18} />
                                    {addingStudents ? 'Adding...' : `Add Selected (${selectedStudents.length})`}
                                </button>
                            )}
                        </div>
                        
                        {/* Enrolled Students List */}
                        <div>
                            <h3 className="mb-3 font-semibold text-ccs-ink">
                                Enrolled Students ({enrolledStudents.length} / {section.max_capacity})
                            </h3>
                            <div className="max-h-64 overflow-y-auto border rounded-lg">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-ccs-orange" />
                                    </div>
                                ) : enrolledStudents.length > 0 ? (
                                    <div className="space-y-1">
                                        {enrolledStudents.map(student => (
                                            <div key={student.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                <div>
                                                    <p className="font-medium text-ccs-ink">{student.name}</p>
                                                    <p className="text-xs text-gray-500">{student.student_id} • {student.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveStudent(student.id, student.name)}
                                                    disabled={removingStudentId === student.id}
                                                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    title="Remove Student"
                                                >
                                                    {removingStudentId === student.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <UserMinus size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-400">
                                        No students enrolled yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Remove Student Confirmation Modal */}
            <AnimatePresence>
                {removeModalOpen && studentToRemove && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60"
                            onClick={() => setRemoveModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-red-50 p-4 border-b border-red-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-red-800">Remove Student</h3>
                                        <p className="text-sm text-red-600">Confirm student removal from section</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Body */}
                            <div className="p-6">
                                <div className="mb-4 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Warning:</strong> This action will remove the student from this section and may affect their class records.
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-500">Student to remove:</p>
                                            <p className="text-base font-semibold text-ccs-ink">{studentToRemove.name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users size={16} className="text-gray-400" />
                                        <span>Current enrollment: {enrolledStudents.length} / {section.max_capacity}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <BookOpen size={16} className="text-gray-400" />
                                        <span>Section: {section.name}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="flex gap-3 p-4 border-t bg-gray-50">
                                <button
                                    onClick={() => setRemoveModalOpen(false)}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRemoveStudent}
                                    disabled={isRemoving}
                                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isRemoving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Removing...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Remove Student
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}