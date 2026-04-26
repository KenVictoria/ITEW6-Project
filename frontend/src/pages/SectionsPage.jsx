// src/pages/SectionsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, LayoutGrid, List, Table as TableIcon, 
  X, ChevronDown, Layers, Users, BookOpen, Calendar, 
  TrendingUp, Sparkles, Eye, Edit2, Trash2, Loader2
} from 'lucide-react'
import { sectionService } from '../services/sectionService'
import { api } from '../lib/axios'
import { SectionsTableView } from '../components/sections/SectionsTableView'
import { SectionsCardView } from '../components/sections/SectionsCardView'
import { SectionsListView } from '../components/sections/SectionsListView'
import { SectionFormModal } from '../components/sections/SectionFormModal'
import { SectionDetailsModal } from '../components/sections/SectionDetailsModal'
import { toast } from 'react-hot-toast'

const VIEWS = {
    TABLE: 'table',
    CARD: 'card',
    LIST: 'list'
}

export function SectionsPage() {
    const [sections, setSections] = useState([])
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    })
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState(VIEWS.TABLE)
    const [modalOpen, setModalOpen] = useState(false)
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)
    const [selectedSection, setSelectedSection] = useState(null)
    const [courses, setCourses] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [sectionToDelete, setSectionToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [filterOptions, setFilterOptions] = useState({
        courses: [],
        semesters: ['1st', '2nd', 'Summer'],
        year_levels: [1, 2, 3, 4]
    })
    const [filters, setFilters] = useState({
        search: '',
        course_id: '',
        semester: '',
        year_level: ''
    })

    useEffect(() => {
        fetchSections()
        fetchCourses()
        fetchFilterOptions()
    }, [filters, pagination.current_page, pagination.per_page])

    const fetchSections = useCallback(async () => {
        setLoading(true)
        try {
            const params = {
                page: pagination.current_page,
                per_page: pagination.per_page,
                ...filters
            }
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key]
            })
            
            const response = await sectionService.getAll(params)
            
            const responseData = response.data
            setSections(responseData.data || [])
            setPagination({
                current_page: responseData.current_page || 1,
                last_page: responseData.last_page || 1,
                per_page: responseData.per_page || 15,
                total: responseData.total || 0
            })
        } catch (error) {
            console.error('Failed to fetch sections:', error)
            toast.error('Failed to load sections')
            setSections([])
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.current_page, pagination.per_page])

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses')
            setCourses(response.data || [])
        } catch (error) {
            console.error('Failed to fetch courses:', error)
        }
    }

    const fetchFilterOptions = async () => {
        try {
            const response = await sectionService.getFilterOptions()
            setFilterOptions(prev => ({
                ...prev,
                courses: response.data.courses || []
            }))
        } catch (error) {
            console.error('Failed to fetch filter options:', error)
        }
    }

    const handleSaveSection = async () => {
        await fetchSections()
        setModalOpen(false)
        setSelectedSection(null)
        toast.success('Section saved successfully')
    }

    const handleEditSection = (section) => {
        setSelectedSection(section)
        setModalOpen(true)
    }

    const handleViewDetails = (section) => {
        setSelectedSection(section)
        setDetailsModalOpen(true)
    }

    const handleDeleteClick = (section) => {
        setSectionToDelete(section)
        setDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!sectionToDelete) return
        
        setIsDeleting(true)
        try {
            await sectionService.delete(sectionToDelete.id)
            toast.success('Section deleted successfully')
            setDeleteModalOpen(false)
            setSectionToDelete(null)
            await fetchSections()
        } catch (error) {
            console.error('Delete error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete section')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRefreshSections = useCallback(async () => {
        await fetchSections()
    }, [fetchSections])

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            setPagination(prev => ({ ...prev, current_page: newPage }))
        }
    }

    const handlePerPageChange = (newPerPage) => {
        setPagination(prev => ({ ...prev, per_page: newPerPage, current_page: 1 }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            course_id: '',
            semester: '',
            year_level: ''
        })
        setPagination(prev => ({ ...prev, current_page: 1 }))
    }

    const hasActiveFilters = filters.search || filters.course_id || filters.semester || filters.year_level

    const renderView = () => {
        const commonProps = {
            sections,
            loading,
            onEdit: handleEditSection,
            onDelete: handleDeleteClick,
            onViewDetails: handleViewDetails,
            pagination,
            onPageChange: handlePageChange,
            onPerPageChange: handlePerPageChange
        }
        
        switch (viewMode) {
            case VIEWS.TABLE:
                return <SectionsTableView {...commonProps} />
            case VIEWS.CARD:
                return <SectionsCardView {...commonProps} />
            case VIEWS.LIST:
                return <SectionsListView {...commonProps} />
            default:
                return <SectionsTableView {...commonProps} />
        }
    }

    // Calculate stats
    const totalStudents = sections.reduce((sum, section) => sum + (section.students_count || 0), 0)
    const avgStudentsPerSection = sections.length > 0 ? Math.round(totalStudents / sections.length) : 0
    const totalCapacity = sections.reduce((sum, section) => sum + (section.max_capacity || 0), 0)
    const utilizationRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0

    if (loading && sections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-ccs-orange"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Layers className="h-6 w-6 text-ccs-orange animate-pulse" />
                    </div>
                </div>
                <p className="text-ccs-muted animate-pulse">Loading sections...</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ccs-orange/10 via-white to-orange-50/30 p-6">
                <div className="absolute top-0 right-0 opacity-10">
                    <Layers size={120} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-xl bg-gradient-to-br from-ccs-orange to-orange-600 p-2 shadow-lg shadow-orange-200">
                                <Layers className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-ccs-ink">Section Management</h1>
                        </div>
                        <p className="text-ccs-muted">
                            Manage class sections, assign students, and track enrollment for the CCS department.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedSection(null)
                            setModalOpen(true)
                        }}
                        className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <Plus size={18} className="transition-transform group-hover:scale-110" />
                        Create Section
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            {sections.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-3 shadow-md">
                        <div className="flex items-center gap-2 text-orange-600">
                            <Layers size={16} />
                            <span className="text-xs font-medium">Total Sections</span>
                        </div>
                        <p className="mt-1 text-xl font-bold text-ccs-ink">{pagination.total}</p>
                    </div>
                    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-md">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Users size={16} />
                            <span className="text-xs font-medium">Enrolled Students</span>
                        </div>
                        <p className="mt-1 text-xl font-bold text-ccs-ink">{totalStudents}</p>
                    </div>
                    <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-md">
                        <div className="flex items-center gap-2 text-green-600">
                            <TrendingUp size={16} />
                            <span className="text-xs font-medium">Avg per Section</span>
                        </div>
                        <p className="mt-1 text-xl font-bold text-ccs-ink">{avgStudentsPerSection}</p>
                    </div>
                    <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3 shadow-md">
                        <div className="flex items-center gap-2 text-purple-600">
                            <Calendar size={16} />
                            <span className="text-xs font-medium">Utilization Rate</span>
                        </div>
                        <p className="mt-1 text-xl font-bold text-ccs-ink">{utilizationRate}%</p>
                    </div>
                </div>
            )}

            {/* Filters Card */}
            <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-4 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-ccs-orange" />
                        <h3 className="font-semibold text-ccs-ink">Filters</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ccs-orange hover:bg-orange-50"
                            >
                                <X size={12} />
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                            {Object.entries(VIEWS).map(([key, value]) => (
                                <button
                                    key={value}
                                    onClick={() => setViewMode(value)}
                                    className={`rounded-lg p-2 transition-all duration-200 ${
                                        viewMode === value
                                            ? 'bg-white text-ccs-orange shadow-sm'
                                            : 'text-gray-500 hover:text-ccs-orange'
                                    }`}
                                    title={value.charAt(0).toUpperCase() + value.slice(1) + ' View'}
                                >
                                    {value === VIEWS.TABLE && <TableIcon size={18} />}
                                    {value === VIEWS.CARD && <LayoutGrid size={18} />}
                                    {value === VIEWS.LIST && <List size={18} />}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-1 text-sm text-ccs-orange md:hidden"
                        >
                            {showFilters ? 'Hide' : 'Show'} filters
                            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
                
                <div className={`flex flex-wrap gap-4 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ccs-orange" size={18} />
                            <input
                                type="text"
                                placeholder="Search sections by name..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, current_page: 1 }))}
                                className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            value={filters.course_id}
                            onChange={(e) => setFilters(prev => ({ ...prev, course_id: e.target.value, current_page: 1 }))}
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
                        >
                            <option value="">All Courses</option>
                            {filterOptions.courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-40">
                        <select
                            value={filters.semester}
                            onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value, current_page: 1 }))}
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
                        >
                            <option value="">All Semesters</option>
                            {filterOptions.semesters.map(s => (
                                <option key={s} value={s}>{s} Semester</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-36">
                        <select
                            value={filters.year_level}
                            onChange={(e) => setFilters(prev => ({ ...prev, year_level: e.target.value, current_page: 1 }))}
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
                        >
                            <option value="">All Year Levels</option>
                            {filterOptions.year_levels.map(y => (
                                <option key={y} value={y}>Year {y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* View Content */}
            {renderView()}

            {/* Empty State for No Results */}
            {!loading && sections.length === 0 && (
                <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-12 text-center shadow-md">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                        <Layers size={40} className="text-gray-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-500">No sections found</p>
                    <p className="mt-1 text-sm text-gray-400">
                        {hasActiveFilters ? 'Try adjusting your filters' : 'Click "Create Section" to get started'}
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-sm text-ccs-orange hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {/* Section Form Modal */}
            <SectionFormModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setSelectedSection(null)
                }}
                onSave={handleSaveSection}
                section={selectedSection}
                courses={courses}
            />
            
            {/* Section Details Modal */}
            <SectionDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false)
                    setSelectedSection(null)
                }}
                section={selectedSection}
                onRefresh={handleRefreshSections}
            />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModalOpen && sectionToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60"
                            onClick={() => setDeleteModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
                        >
                            <div className="bg-red-50 p-5 border-b border-red-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                        <Trash2 className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-red-800">Delete Section</h3>
                                        <p className="text-sm text-red-600">Confirm section removal</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200 mb-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Warning:</strong> This action will permanently delete this section from the system. This cannot be undone and will remove all student enrollments in this section.
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100">
                                            <Layers className="h-6 w-6 text-ccs-orange" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-500">Section to remove:</p>
                                            <p className="text-base font-semibold text-ccs-ink">{sectionToDelete.name}</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    Course: {sectionToDelete.course_code || sectionToDelete.course?.code || 'N/A'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Year: {sectionToDelete.year_level}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Semester: {sectionToDelete.semester}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Students enrolled: {sectionToDelete.students_count || 0} / {sectionToDelete.max_capacity || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 p-5 border-t bg-gray-50">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    disabled={isDeleting}
                                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Delete Section
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}