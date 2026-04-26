// src/components/schedule/ScheduleTableView.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Trash2, ChevronDown, ChevronUp, Clock, MapPin, User, Book, Calendar as CalendarIcon, Plus } from 'lucide-react'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function ScheduleTableView({ schedules, onEdit, onDelete, onAdd, loading }) {
    const [expandedRows, setExpandedRows] = useState({})
    const [filterDay, setFilterDay] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterSemester, setFilterSemester] = useState('')

    const toggleRow = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const filteredSchedules = schedules.filter(schedule => {
        if (filterDay && schedule.day_of_week !== filterDay) return false
        if (filterStatus && schedule.status !== filterStatus) return false
        if (filterSemester && schedule.semester !== filterSemester) return false
        return true
    })

    const getStatusBadge = (status) => {
        const styles = {
            'scheduled': 'bg-orange-100 text-orange-700',
            'ongoing': 'bg-green-100 text-green-700',
            'completed': 'bg-gray-100 text-gray-700',
            'cancelled': 'bg-red-100 text-red-700'
        }
        return styles[status] || styles.scheduled
    }

    // Helper function to get course code from various possible formats
    const getCourseCode = (schedule) => {
        if (schedule.course?.course_code) return schedule.course.course_code
        if (schedule.course?.code) return schedule.course.code
        if (schedule.course_code) return schedule.course_code
        return 'N/A'
    }

    // Helper function to get course name from various possible formats
    const getCourseName = (schedule) => {
        if (schedule.course?.course_name) return schedule.course.course_name
        if (schedule.course?.title) return schedule.course.title
        if (schedule.course_name) return schedule.course_name
        return 'N/A'
    }

    // Helper function to get faculty name
    const getFacultyName = (schedule) => {
        if (schedule.faculty?.name) return schedule.faculty.name
        if (schedule.faculty_name) return schedule.faculty_name
        return 'N/A'
    }

    // Helper function to get room code
    const getRoomCode = (schedule) => {
        if (schedule.room?.room_code) return schedule.room.room_code
        if (schedule.room?.code) return schedule.room.code
        if (schedule.room_code) return schedule.room_code
        return 'N/A'
    }

    // Helper function to get section name
    const getSectionName = (schedule) => {
        if (schedule.section?.section_name) return schedule.section.section_name
        if (schedule.section?.name) return schedule.section.name
        if (schedule.section_name) return schedule.section_name
        return 'N/A'
    }

    // Helper function to get time slot
    const getTimeSlot = (schedule) => {
        if (schedule.time_slot) return schedule.time_slot
        const start = schedule.start_time?.substring(0, 5) || 'N/A'
        const end = schedule.end_time?.substring(0, 5) || 'N/A'
        return `${start} - ${end}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-ccs-orange border-t-transparent" />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-white/60 bg-white/80 shadow-lg shadow-orange-500/5 backdrop-blur-md overflow-hidden"
        >
            {/* Header with filters */}
            <div className="border-b border-white/40 bg-white/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterDay}
                            onChange={(e) => setFilterDay(e.target.value)}
                            className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm text-ccs-ink focus:border-ccs-orange focus:outline-none"
                        >
                            <option value="">All Days</option>
                            {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                        
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm text-ccs-ink focus:border-ccs-orange focus:outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            value={filterSemester}
                            onChange={(e) => setFilterSemester(e.target.value)}
                            className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm text-ccs-ink focus:border-ccs-orange focus:outline-none"
                        >
                            <option value="">All Semesters</option>
                            <option value="1st">1st Semester</option>
                            <option value="2nd">2nd Semester</option>
                            <option value="Summer">Summer</option>
                        </select>
                    </div>
                    
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 rounded-xl bg-ccs-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-ccs-orange-dark"
                    >
                        <Plus size={16} />
                        Add Schedule
                    </button>
                </div>
            </div>

            {/* Schedule Table */}
            {filteredSchedules.length === 0 ? (
                <div className="py-12 text-center">
                    <CalendarIcon size={48} className="mx-auto text-ccs-muted/50" />
                    <p className="mt-3 text-ccs-muted">No schedules found</p>
                    <button onClick={onAdd} className="mt-3 text-sm font-medium text-ccs-orange hover:underline">
                        Create your first schedule
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-white/40 bg-white/30">
                            <tr>
                                <th className="w-10 p-4 text-left text-sm font-semibold text-ccs-ink"></th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Course</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Faculty</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Room</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Section</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Day & Time</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Semester</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Status</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSchedules.map((schedule, idx) => (
                                <React.Fragment key={schedule.id}>
                                    <tr
                                        className="cursor-pointer border-b border-white/20 transition-colors hover:bg-orange-50/30"
                                        onClick={() => toggleRow(schedule.id)}
                                    >
                                        <td className="p-4">
                                            {expandedRows[schedule.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium text-ccs-ink">{getCourseCode(schedule)}</div>
                                                <div className="text-xs text-ccs-muted">{getCourseName(schedule)}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                                                    <User size={14} className="text-ccs-orange" />
                                                </div>
                                                <span className="text-sm">{getFacultyName(schedule)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} className="text-ccs-muted" />
                                                <span className="text-sm">{getRoomCode(schedule)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm">{getSectionName(schedule)}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm font-medium text-ccs-ink">
                                                    <CalendarIcon size={12} className="text-ccs-orange" />
                                                    <span>{schedule.day_of_week || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-ccs-muted">
                                                    <Clock size={12} />
                                                    <span>{getTimeSlot(schedule)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm">
                                                {schedule.semester || 'N/A'} ({schedule.school_year || 'N/A'})
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(schedule.status)}`}>
                                                {schedule.status || 'scheduled'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEdit(schedule); }}
                                                    className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                                                    title="Edit schedule"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(schedule); }}
                                                    className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50"
                                                    title="Delete schedule"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    {/* Expanded Details Row */}
                                    {expandedRows[schedule.id] && (
                                        <tr className="bg-orange-50/20">
                                            <td colSpan="9" className="p-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                                    <div>
                                                        <span className="text-ccs-muted">Created:</span>
                                                        <span className="ml-2 font-medium text-ccs-ink">
                                                            {schedule.created_at ? new Date(schedule.created_at).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-ccs-muted">Last Updated:</span>
                                                        <span className="ml-2 font-medium text-ccs-ink">
                                                            {schedule.updated_at ? new Date(schedule.updated_at).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    {schedule.notes && (
                                                        <div className="col-span-2 md:col-span-4 mt-2">
                                                            <span className="text-ccs-muted">Notes:</span>
                                                            <p className="mt-1 text-ccs-ink">{schedule.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    )
}