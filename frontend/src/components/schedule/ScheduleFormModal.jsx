// src/components/schedule/ScheduleFormModal.jsx

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Clock, MapPin, User, Book, Calendar as CalendarIcon } from 'lucide-react'
import { scheduleService } from '../../services/scheduleService'
import { api } from '../../lib/axios'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function ScheduleFormModal({ isOpen, onClose, onSave, schedule, courses, faculties, rooms, sections }) {
    const [formData, setFormData] = useState({
        course_id: '',
        faculty_id: '',
        room_id: '',
        section_id: '',
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '10:00',
        semester: '1st',
        school_year: new Date().getFullYear(),
        status: 'scheduled',
        notes: ''
    })
    
    const [conflicts, setConflicts] = useState([])
    const [checkingConflicts, setCheckingConflicts] = useState(false)
    const [availableSlots, setAvailableSlots] = useState([])
    const [loadingSlots, setLoadingSlots] = useState(false)

    useEffect(() => {
        if (schedule) {
            setFormData({
                course_id: schedule.course_id || '',
                faculty_id: schedule.faculty_id || '',
                room_id: schedule.room_id || '',
                section_id: schedule.section_id || '',
                day_of_week: schedule.day_of_week || 'Monday',
                start_time: schedule.start_time?.substring(0, 5) || '09:00',
                end_time: schedule.end_time?.substring(0, 5) || '10:00',
                semester: schedule.semester || '1st',
                school_year: schedule.school_year || new Date().getFullYear(),
                status: schedule.status || 'scheduled',
                notes: schedule.notes || ''
            })
        }
    }, [schedule])

    useEffect(() => {
        if (formData.room_id && formData.day_of_week && isOpen) {
            fetchAvailableTimeSlots()
        }
    }, [formData.room_id, formData.day_of_week, formData.semester, formData.school_year, isOpen])

    const fetchAvailableTimeSlots = async () => {
        setLoadingSlots(true)
        try {
            const response = await scheduleService.getAvailableTimeSlots({
                room_id: formData.room_id,
                day_of_week: formData.day_of_week,
                semester: formData.semester,
                school_year: formData.school_year
            })
            setAvailableSlots(response.data.available_slots || [])
        } catch (error) {
            console.error('Failed to fetch available slots:', error)
        } finally {
            setLoadingSlots(false)
        }
    }

    const checkConflicts = async () => {
        setCheckingConflicts(true)
        setConflicts([])
        
        try {
            // Create a temporary schedule to check conflicts
            const tempSchedule = {
                room_id: parseInt(formData.room_id),
                faculty_id: parseInt(formData.faculty_id),
                day_of_week: formData.day_of_week,
                start_time: formData.start_time,
                end_time: formData.end_time,
                semester: formData.semester,
                school_year: parseInt(formData.school_year)
            }
            
            // Try to create (will throw if conflict)
            const response = await scheduleService.create(tempSchedule)
            // If success, delete it (we were just checking)
            if (response.data.schedule?.id) {
                await scheduleService.delete(response.data.schedule.id)
            }
            setConflicts([])
        } catch (error) {
            if (error.response?.data?.errors?.schedule) {
                setConflicts(error.response.data.errors.schedule)
            } else if (error.response?.data?.message) {
                setConflicts([{ message: error.response.data.message }])
            } else {
                setConflicts([{ message: 'Unknown conflict occurred' }])
            }
        } finally {
            setCheckingConflicts(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            if (schedule) {
                await scheduleService.update(schedule.id, formData)
            } else {
                await scheduleService.create(formData)
            }
            onSave()
            onClose()
        } catch (error) {
            if (error.response?.data?.errors?.schedule) {
                setConflicts(error.response.data.errors.schedule)
            } else {
                alert('Failed to save schedule: ' + (error.response?.data?.message || 'Unknown error'))
            }
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setConflicts([]) // Clear conflicts when form changes
    }

    if (!isOpen) return null

    return (
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
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
                <div className="sticky top-0 border-b border-gray-100 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-ccs-ink">
                            {schedule ? 'Edit Schedule' : 'Create New Schedule'}
                        </h2>
                        <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:bg-gray-100">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Course and Faculty */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-ccs-ink">
                                <Book size={14} className="mr-1 inline" /> Course
                            </label>
                            <select
                                name="course_id"
                                value={formData.course_id}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                                required
                            >
                                <option value="">Select Course</option>
                                {courses && courses.length > 0 ? (
                                    courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.code || course.course_code} - {course.title || course.course_name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No courses available. Please add courses first.</option>
                                )}
                            </select>
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-ccs-ink">
                                <User size={14} className="mr-1 inline" /> Faculty
                            </label>
                            <select
                                name="faculty_id"
                                value={formData.faculty_id}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                                required
                            >
                                <option value="">Select Faculty</option>
                                {faculties.map(faculty => (
                                    <option key={faculty.id} value={faculty.id}>
                                        {faculty.name} - {faculty.department}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                   {/* Room and Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-ccs-ink">
                                <MapPin size={14} className="mr-1 inline" /> Room
                            </label>
                            <select
                                name="room_id"
                                value={formData.room_id}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                                required
                            >
                                <option value="">Select Room</option>
                                {rooms && rooms.length > 0 ? (
                                    rooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.room_code || room.code || room.name || 'N/A'} - {room.building || ''} (Cap: {room.capacity || 0})
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No rooms available. Please add rooms first.</option>
                                )}
                            </select>
                            {rooms && rooms.length === 0 && (
                                <p className="mt-1 text-xs text-red-500">No rooms found. Please add rooms in the Room Management section.</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-ccs-ink">Section</label>
                            <select
                                name="section_id"
                                value={formData.section_id}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            >
                                <option value="">Select Section</option>
                                {sections && sections.length > 0 ? (
                                    sections.map(section => (
                                        <option key={section.id} value={section.id}>
                                            {section.section_name || section.name || 'N/A'} (Max: {section.max_capacity || 0})
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No sections available</option>
                                )}
                            </select>
                        </div>
                    </div>
                    
                    {/* Schedule Time */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-ccs-ink">Day</label>
                            <select
                                name="day_of_week"
                                value={formData.day_of_week}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            >
                                {daysOfWeek.map(day => <option key={day}>{day}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-ccs-ink">Start Time</label>
                            <input
                                type="time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-ccs-ink">End Time</label>
                            <input
                                type="time"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    
                    {/* Academic Period */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-ccs-ink">Semester</label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            >
                                <option value="1st">1st Semester</option>
                                <option value="2nd">2nd Semester</option>
                                <option value="Summer">Summer</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-ccs-ink">School Year</label>
                            <input
                                type="number"
                                name="school_year"
                                value={formData.school_year}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    
                    {/* Status (only for edit) */}
                    {schedule && (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-ccs-ink">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            >
                                <option value="scheduled">Scheduled</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    )}
                    
                    {/* Notes */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-ccs-ink">Notes (Optional)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            placeholder="Any additional notes about this schedule..."
                        />
                    </div>
                    
                    {/* Available Time Slots */}
                    {availableSlots.length > 0 && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-green-700">
                                <CheckCircle size={16} />
                                <span className="font-medium">Available Time Slots for this Room</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableSlots.map((slot, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                start_time: slot.start,
                                                end_time: slot.end
                                            }))
                                        }}
                                        className="rounded-lg border border-green-300 bg-white px-3 py-1 text-sm transition-colors hover:bg-green-100"
                                    >
                                        {slot.label || `${slot.start} - ${slot.end}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Conflict Display */}
                    {conflicts.length > 0 && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-red-700">
                                <AlertCircle size={16} />
                                <span className="font-medium">Schedule Conflicts Detected</span>
                            </div>
                            <ul className="space-y-1">
                                {conflicts.map((conflict, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-red-600">
                                        <span className="text-red-400">•</span>
                                        <span>{conflict.message}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={checkConflicts}
                            disabled={checkingConflicts}
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-ccs-ink transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            {checkingConflicts ? 'Checking...' : 'Check Conflicts'}
                        </button>
                        
                        <button
                            type="submit"
                            disabled={checkingConflicts || conflicts.length > 0}
                            className="flex-1 rounded-xl bg-ccs-orange px-4 py-2 font-semibold text-white transition-colors hover:bg-ccs-orange-dark disabled:opacity-50"
                        >
                            {schedule ? 'Update Schedule' : 'Create Schedule'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}