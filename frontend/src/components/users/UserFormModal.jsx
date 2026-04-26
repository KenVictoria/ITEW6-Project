// src/components/users/UserFormModal.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Eye, EyeOff } from 'lucide-react'
import { userService } from '../../services/userService'
import { toast } from 'react-hot-toast'

export function UserFormModal({ isOpen, onClose, onSave, user, faculties, roleOptions }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        faculty_id: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                password_confirmation: '',
                role: user.role || '',
                faculty_id: user.faculty_id || ''
            })
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: '',
                faculty_id: ''
            })
        }
        setErrors({})
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        
        try {
            if (user) {
                // Update existing user
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    faculty_id: formData.faculty_id || null
                }
                if (formData.password) {
                    updateData.password = formData.password
                }
                await userService.update(user.id, updateData)
                toast.success('User updated successfully')
            } else {
                // Create new user
                if (formData.password !== formData.password_confirmation) {
                    setErrors({ password: ['Passwords do not match'] })
                    setLoading(false)
                    return
                }
                await userService.create(formData)
                toast.success('User created successfully')
            }
            onSave()
            onClose()
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors)
            } else {
                toast.error(error.response?.data?.message || 'Failed to save user')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
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
                        {user ? 'Edit User' : 'Add New User'}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ccs-ink">Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ccs-ink">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email[0]}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ccs-ink">Role *</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                            required
                        >
                            <option value="">Select Role</option>
                            {roleOptions.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="mt-1 text-xs text-red-500">{errors.role[0]}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ccs-ink">Associated Faculty (Optional)</label>
                        <select
                            name="faculty_id"
                            value={formData.faculty_id}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                        >
                            <option value="">None</option>
                            {faculties.map(faculty => (
                                <option key={faculty.id} value={faculty.id}>
                                    {faculty.name} - {faculty.department}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ccs-ink">
                            {user ? 'New Password (leave blank to keep current)' : 'Password *'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 focus:border-ccs-orange focus:outline-none"
                                required={!user}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ccs-orange"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password[0]}</p>
                        )}
                    </div>
                    
                    {!user && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ccs-ink">Confirm Password *</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-ccs-orange focus:outline-none"
                                required={!user}
                            />
                        </div>
                    )}
                    
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
                            {loading ? 'Saving...' : (user ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}