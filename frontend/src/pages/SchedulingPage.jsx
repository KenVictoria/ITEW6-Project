import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Table, RefreshCw, AlertTriangle, Clock, Users, MapPin, Book,
  ChevronLeft, ChevronRight, Filter, X, Sparkles, BarChart3, 
  CheckCircle, Award, DoorOpen, UserCheck, Layers, Loader2, Trash2
} from 'lucide-react'
import { scheduleService } from '../services/scheduleService'
import { api } from '../lib/axios'
import { ScheduleCalendar } from '../components/schedule/ScheduleCalendar'
import { ScheduleTableView } from '../components/schedule/ScheduleTableView'
import { ScheduleFormModal } from '../components/schedule/ScheduleFormModal'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

// Table Skeleton Component
const TableSkeleton = () => (
    <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 shadow-md overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                    <div className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                        {[...Array(9)].map((_, i) => (
                            <th key={i} className="p-4">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-100">
                            {[...Array(9)].map((_, j) => (
                                <td key={j} className="p-4">
                                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)

// Calendar Skeleton Component
const CalendarSkeleton = () => (
    <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-4 shadow-md">
        <div className="mb-4 flex items-center justify-between">
            <div>
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
            </div>
        </div>
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>
    </div>
)

export function SchedulingPage() {
    const { user } = useAuth()
    const [viewMode, setViewMode] = useState('calendar')
    const [schedules, setSchedules] = useState([])
    const [calendarEvents, setCalendarEvents] = useState([])
    const [courses, setCourses] = useState([])
    const [faculties, setFaculties] = useState([])
    const [rooms, setRooms] = useState([])
    const [sections, setSections] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedSchedule, setSelectedSchedule] = useState(null)
    const [stats, setStats] = useState(null)
    const [dataLoaded, setDataLoaded] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [scheduleToDelete, setScheduleToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Function to check if token exists
    const checkAuth = useCallback(() => {
        const token = localStorage.getItem('ccs_auth_token')
        if (!token) {
            toast.error('Please login again')
            window.location.href = '/login'
            return false
        }
        
        // Ensure token is set in headers
        if (api.defaults.headers.common.Authorization !== `Bearer ${token}`) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`
        }
        return true
    }, [])

    const fetchAllData = useCallback(async () => {
        // Check authentication before fetching
        if (!checkAuth()) return
        
        setLoading(true)
        try {
            console.log('=== FETCHING ALL DATA ===')
            
            // Add a small delay to ensure token is set
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Fetch courses
            const coursesRes = await api.get('/courses')
            console.log('Courses API Response:', coursesRes.data)
            setCourses(coursesRes.data || [])
            
            // Fetch faculties
            const facultiesRes = await api.get('/faculties')
            console.log('Faculties API Response:', facultiesRes.data)
            setFaculties(facultiesRes.data || [])
            
            // Fetch rooms
            const roomsRes = await api.get('/rooms')
            console.log('Rooms API Response:', roomsRes.data)
            setRooms(roomsRes.data || [])
            
            // Fetch sections
            const sectionsRes = await api.get('/sections')
            console.log('Sections API Response:', sectionsRes.data)
            // Handle both paginated and non-paginated responses
            const sectionsData = sectionsRes.data?.data || sectionsRes.data || []
            console.log('Sections data:', sectionsData)
            console.log('Sections count:', sectionsData.length)
            setSections(sectionsData)
            
            // Fetch schedules
            const schedulesRes = await scheduleService.getAll()
            console.log('Schedules Response:', schedulesRes.data)
            setSchedules(schedulesRes.data.schedules || [])
            setCalendarEvents(schedulesRes.data.calendar_events || [])
            
            // Fetch statistics
            try {
                const statsRes = await scheduleService.getStatistics()
                setStats(statsRes.data)
            } catch (e) {
                console.log('Stats not available yet')
            }
            
            setDataLoaded(true)
            
        } catch (error) {
            console.error('Failed to fetch data:', error)
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                window.location.href = '/login'
            } else {
                toast.error('Failed to load data: ' + (error.response?.data?.message || error.message))
            }
            setDataLoaded(false)
        } finally {
            setLoading(false)
        }
    }, [checkAuth])

    // Initial fetch
    useEffect(() => {
        // Ensure token is set before fetching
        const token = localStorage.getItem('ccs_auth_token')
        if (token) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`
            fetchAllData()
        } else {
            toast.error('Please login to access this page')
            window.location.href = '/login'
        }
    }, [fetchAllData])

    const handleSaveSchedule = async () => {
        await fetchAllData()
        setModalOpen(false)
        setSelectedSchedule(null)
        toast.success('Schedule saved successfully')
    }

    const handleEditSchedule = (schedule) => {
        console.log('Editing schedule:', schedule)
        setSelectedSchedule(schedule)
        setModalOpen(true)
    }

    const handleDeleteClick = (schedule) => {
        setScheduleToDelete(schedule)
        setDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!scheduleToDelete) return
        
        setIsDeleting(true)
        try {
            await scheduleService.delete(scheduleToDelete.id)
            toast.success('Schedule deleted successfully')
            setDeleteModalOpen(false)
            setScheduleToDelete(null)
            await fetchAllData()
        } catch (error) {
            console.error('Delete error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete schedule')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleAddSchedule = () => {
        console.log('Opening add schedule modal')
        setSelectedSchedule(null)
        setModalOpen(true)
    }

    // Calculate stats for display
    const activeSchedules = schedules.filter(s => s.status === 'scheduled' || s.status === 'ongoing').length
    const completedSchedules = schedules.filter(s => s.status === 'completed').length

    if (loading && schedules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-ccs-orange"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-ccs-orange animate-pulse" />
                    </div>
                </div>
                <p className="text-ccs-muted animate-pulse">Loading schedule data...</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ccs-orange/10 via-white to-orange-50/30 p-6">
                <div className="absolute top-0 right-0 opacity-10">
                    <Calendar size={120} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-xl bg-gradient-to-br from-ccs-orange to-orange-600 p-2 shadow-lg shadow-orange-200">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-ccs-ink">Schedule Management</h1>
                        </div>
                        <p className="text-ccs-muted">
                            Manage course schedules, faculty assignments, and room allocations for the CCS department.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchAllData()}
                            className="group flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 text-ccs-ink transition-all hover:border-ccs-orange/50 hover:bg-white hover:shadow-md"
                        >
                            <RefreshCw size={16} className="transition-transform group-hover:rotate-180" />
                            Refresh
                        </button>
                        
                        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200 ${
                                    viewMode === 'calendar'
                                        ? 'bg-gradient-to-r from-ccs-orange to-orange-600 text-white shadow-md'
                                        : 'text-ccs-ink hover:bg-white/50'
                                }`}
                            >
                                <Calendar size={16} />
                                <span>Calendar</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200 ${
                                    viewMode === 'table'
                                        ? 'bg-gradient-to-r from-ccs-orange to-orange-600 text-white shadow-md'
                                        : 'text-ccs-ink hover:bg-white/50'
                                }`}
                            >
                                <Table size={16} />
                                <span>Table View</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-3 shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-ccs-muted">Total Schedules</p>
                                <p className="text-2xl font-bold text-ccs-ink">{stats.total_schedules || 0}</p>
                            </div>
                            <div className="rounded-xl bg-orange-100 p-2">
                                <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-ccs-muted">Active</p>
                                <p className="text-2xl font-bold text-green-600">{activeSchedules}</p>
                            </div>
                            <div className="rounded-xl bg-green-100 p-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-ccs-muted">Completed</p>
                                <p className="text-2xl font-bold text-blue-600">{completedSchedules}</p>
                            </div>
                            <div className="rounded-xl bg-blue-100 p-2">
                                <Award className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3 shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-ccs-muted">Courses</p>
                                <p className="text-2xl font-bold text-ccs-ink">{courses.length}</p>
                            </div>
                            <div className="rounded-xl bg-purple-100 p-2">
                                <Book className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resource Stats Row */}
            {stats && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-100 p-2">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-ccs-muted">Faculty Members</p>
                                <p className="text-xl font-bold text-ccs-ink">{faculties.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-green-100 p-2">
                                <DoorOpen className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-ccs-muted">Available Rooms</p>
                                <p className="text-xl font-bold text-ccs-ink">{rooms.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-3 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-orange-100 p-2">
                                <Layers className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-ccs-muted">Sections</p>
                                <p className="text-xl font-bold text-ccs-ink">{sections.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Loading/Status Messages */}
            {(loading || !dataLoaded) && (
                <div className="rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-yellow-700">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">
                            Loading schedule data. Please wait...
                        </span>
                    </div>
                </div>
            )}
            
            {/* Success Message */}
            {!loading && dataLoaded && (
                <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-green-700">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">
                            Schedule data loaded successfully. {sections.length} sections available.
                        </span>
                    </div>
                </div>
            )}
            
            {/* View Content */}
            {loading ? (
                viewMode === 'calendar' ? <CalendarSkeleton /> : <TableSkeleton />
            ) : (
                viewMode === 'calendar' ? (
                    <ScheduleCalendar
                        events={calendarEvents}
                        onEventClick={handleEditSchedule}
                        onDateSelect={() => handleAddSchedule()}
                        loading={loading}
                    />
                ) : (
                    <ScheduleTableView
                        schedules={schedules}
                        onEdit={handleEditSchedule}
                        onDelete={handleDeleteClick}
                        onAdd={handleAddSchedule}
                        loading={loading}
                    />
                )
            )}
            
            {/* Schedule Form Modal */}
            <ScheduleFormModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setSelectedSchedule(null)
                }}
                onSave={handleSaveSchedule}
                schedule={selectedSchedule}
                courses={courses}
                faculties={faculties}
                rooms={rooms}
                sections={sections}
            />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModalOpen && scheduleToDelete && (
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
                                        <h3 className="text-lg font-semibold text-red-800">Delete Schedule</h3>
                                        <p className="text-sm text-red-600">Confirm schedule removal</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200 mb-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Warning:</strong> This action will permanently delete this schedule from the system. This cannot be undone and may affect class assignments.
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100">
                                            <Calendar className="h-6 w-6 text-ccs-orange" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-500">Schedule to remove:</p>
                                            <p className="text-base font-semibold text-ccs-ink">
                                                {scheduleToDelete.course?.code || scheduleToDelete.course_code || 'N/A'} - 
                                                {scheduleToDelete.course?.title || scheduleToDelete.course_name || 'N/A'}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {scheduleToDelete.day_of_week}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {scheduleToDelete.start_time?.substring(0, 5)} - {scheduleToDelete.end_time?.substring(0, 5)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {scheduleToDelete.room?.code || scheduleToDelete.room_code || 'N/A'}
                                                </span>
                                            </div>
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
                                            Delete Schedule
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