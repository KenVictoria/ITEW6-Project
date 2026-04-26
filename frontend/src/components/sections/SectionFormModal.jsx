// src/components/sections/SectionFormModal.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'
import { sectionService } from '../../services/sectionService'
import { toast } from 'react-hot-toast'

export function SectionFormModal({ isOpen, onClose, onSave, section, courses }) {
    const [formData, setFormData] = useState({
        course_id: '',
        name: '',
        academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        semester: '1st',
        year_level: 1,
        max_capacity: 40
    })
    const [loading, setLoading] = useState(false)
    const [duplicateError, setDuplicateError] = useState(null)

    useEffect(() => {
        if (section) {
            setFormData({
                course_id: section.course_id || '',
                name: section.name || '',
                academic_year: section.academic_year || (new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)),
                semester: section.semester || '1st',
                year_level: section.year_level || 1,
                max_capacity: section.max_capacity || 40
            })
        } else {
            setFormData({
                course_id: '',
                name: '',
                academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
                semester: '1st',
                year_level: 1,
                max_capacity: 40
            })
        }
        setDuplicateError(null)
    }, [section])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setDuplicateError(null)
        
        try {
            if (section) {
                await sectionService.update(section.id, formData)
                toast.success('Section updated successfully')
            } else {
                await sectionService.create(formData)
                toast.success('Section created successfully')
            }
            onSave()
            onClose()
        } catch (error) {
            if (error.response?.status === 422 && error.response?.data?.duplicate) {
                setDuplicateError(error.response.data)
                toast.error(error.response.data.message)
            } else {
                toast.error(error.response?.data?.message || 'Failed to save section')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setDuplicateError(null) // Clear duplicate error when user changes any field
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
                className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <h2 className="text-xl font-bold text-ccs-ink">
                        {section ? 'Edit Section' : 'Create New Section'}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Duplicate Error Display */}
                    {duplicateError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2 text-red-700">
                                <AlertCircle size={16} />
                                <span className="font-medium">Duplicate Section Detected</span>
                            </div>
                            <p className="mt-1 text-sm text-red-600">{duplicateError.message}</p>
                            {duplicateError.duplicate && (
                                <div className="mt-2 rounded-lg bg-red-100 p-2 text-xs text-red-700">
                                    <p>Existing section: <strong>{duplicateError.duplicate.name}</strong></p>
                                    <p>Course: {duplicateError.duplicate.course_code}</p>
                                    <p>Academic Year: {duplicateError.duplicate.academic_year} - {duplicateError.duplicate.semester}</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ccs-ink">Course *</label>
                        <select
                            name="course_id"
                            value={formData.course_id}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            required
                        >
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ccs-ink">Section Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., BSIT-1A, BSCS-2B"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-400">Section names must be unique per course, academic year, and semester</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ccs-ink">Year Level *</label>
                            <select
                                name="year_level"
                                value={formData.year_level}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                                required
                            >
                                <option value={1}>Year 1</option>
                                <option value={2}>Year 2</option>
                                <option value={3}>Year 3</option>
                                <option value={4}>Year 4</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ccs-ink">Semester *</label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                                required
                            >
                                <option value="1st">1st Semester</option>
                                <option value="2nd">2nd Semester</option>
                                <option value="Summer">Summer</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ccs-ink">Academic Year *</label>
                        <input
                            type="text"
                            name="academic_year"
                            value={formData.academic_year}
                            onChange={handleChange}
                            placeholder="YYYY-YYYY"
                            pattern="\d{4}-\d{4}"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-400">Format: 2024-2025</p>
                    </div>
                    
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ccs-ink">Max Capacity *</label>
                        <input
                            type="number"
                            name="max_capacity"
                            value={formData.max_capacity}
                            onChange={handleChange}
                            min="1"
                            max="100"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            required
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-ccs-ink hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-ccs-orange px-4 py-2 font-semibold text-white hover:bg-ccs-orange-dark disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (section ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}