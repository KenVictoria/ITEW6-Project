// src/pages/UsersPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, 
  UserCog, Shield, Mail, Calendar, Loader2, Filter, X, 
  Users, UserPlus, Sparkles, ChevronDown, Eye
} from 'lucide-react'
import { userService } from '../services/userService'
import { api } from '../lib/axios'
import { UserFormModal } from '../components/users/UserFormModal'
import { DeleteConfirmModal } from '../components/users/DeleteConfirmModal'
import { toast } from 'react-hot-toast'

export default function UsersPage() {
    const [users, setUsers] = useState([])
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    })
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [faculties, setFaculties] = useState([])
    const [roleOptions, setRoleOptions] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        search: '',
        role: ''
    })

    useEffect(() => {
        fetchUsers()
        fetchFaculties()
        fetchRoleOptions()
    }, [filters, pagination.current_page, pagination.per_page])

    const fetchUsers = useCallback(async () => {
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
            
            const response = await userService.getAll(params)
            setUsers(response.data.data || [])
            setPagination({
                current_page: response.data.current_page || 1,
                last_page: response.data.last_page || 1,
                per_page: response.data.per_page || 15,
                total: response.data.total || 0
            })
        } catch (error) {
            console.error('Failed to fetch users:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.current_page, pagination.per_page])

    const fetchFaculties = async () => {
        try {
            const response = await api.get('/faculties')
            setFaculties(response.data || [])
        } catch (error) {
            console.error('Failed to fetch faculties:', error)
        }
    }

    const fetchRoleOptions = async () => {
        try {
            const response = await userService.getRoleOptions()
            setRoleOptions(response.data.roles || [])
        } catch (error) {
            console.error('Failed to fetch role options:', error)
            setRoleOptions([
                { value: 'admin', label: 'Admin', description: 'Full system access', color: 'red' },
                { value: 'dean', label: 'Dean / Department Chair', description: 'Academic management access', color: 'blue' },
                { value: 'secretary', label: 'Secretary', description: 'Student and section management', color: 'green' }
            ])
        }
    }

    const handleSaveUser = async () => {
        await fetchUsers()
        setModalOpen(false)
        setSelectedUser(null)
        toast.success('User saved successfully')
    }

    const handleEditUser = (user) => {
        setSelectedUser(user)
        setModalOpen(true)
    }

    const handleDeleteClick = (user) => {
        setSelectedUser(user)
        setDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return
        
        try {
            await userService.delete(selectedUser.id)
            toast.success('User deleted successfully')
            await fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user')
        } finally {
            setDeleteModalOpen(false)
            setSelectedUser(null)
        }
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            setPagination(prev => ({ ...prev, current_page: newPage }))
        }
    }

    const handlePerPageChange = (newPerPage) => {
        setPagination(prev => ({ ...prev, per_page: newPerPage, current_page: 1 }))
    }

    const clearFilters = () => {
        setFilters({ search: '', role: '' })
        setPagination(prev => ({ ...prev, current_page: 1 }))
    }

    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'admin': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm shadow-red-200'
            case 'dean': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-200'
            case 'secretary': return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm shadow-green-200'
            default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm shadow-gray-200'
        }
    }

    const getRoleIcon = (role) => {
        switch(role) {
            case 'admin': return <Shield size={14} className="mr-1" />
            case 'dean': return <UserCog size={14} className="mr-1" />
            case 'secretary': return <Users size={14} className="mr-1" />
            default: return null
        }
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
            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
                <div className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-ccs-ink">{startItem}</span> to{' '}
                    <span className="font-semibold text-ccs-ink">{endItem}</span> of{' '}
                    <span className="font-semibold text-ccs-ink">{total}</span> users
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={per_page}
                        onChange={(e) => handlePerPageChange(Number(e.target.value))}
                        className="rounded-lg border-2 border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:border-ccs-orange focus:outline-none"
                    >
                        <option value={15}>15 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(current_page - 1)}
                            disabled={current_page === 1}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        {getPageNumbers().map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`min-w-[34px] rounded-lg px-2 py-1 text-sm font-medium transition-all duration-200 ${
                                    page === current_page
                                        ? 'bg-gradient-to-r from-ccs-orange to-orange-600 text-white shadow-md shadow-orange-200'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(current_page + 1)}
                            disabled={current_page === last_page}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-ccs-orange"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Users className="h-6 w-6 text-ccs-orange animate-pulse" />
                    </div>
                </div>
                <p className="text-ccs-muted animate-pulse">Loading users...</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ccs-orange/10 via-white to-orange-50/30 p-6">
                <div className="absolute top-0 right-0 opacity-10">
                    <Users size={120} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-xl bg-gradient-to-br from-ccs-orange to-orange-600 p-2 shadow-lg shadow-orange-200">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-ccs-ink">User Management</h1>
                        </div>
                        <p className="text-ccs-muted">
                            Manage system users, assign roles, and control access permissions for the CCS department.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedUser(null)
                            setModalOpen(true)
                        }}
                        className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <UserPlus size={18} className="transition-transform group-hover:scale-110" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Filters Card */}
            <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-4 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-ccs-orange" />
                        <h3 className="font-semibold text-ccs-ink">Filters</h3>
                        {(filters.search || filters.role) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ccs-orange hover:bg-orange-50"
                            >
                                <X size={12} />
                                Clear all
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-1 text-sm text-ccs-orange md:hidden"
                    >
                        {showFilters ? 'Hide' : 'Show'} filters
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                
                <div className={`flex flex-wrap gap-4 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ccs-orange" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or role..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, current_page: 1 }))}
                                className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-64">
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, current_page: 1 }))}
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
                        >
                            <option value="">All Roles</option>
                            {roleOptions.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">User</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Email</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Role</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Faculty</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Created</th>
                                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="border-b border-gray-100 transition-colors hover:bg-orange-50/40 group"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100 font-semibold text-ccs-orange">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-ccs-ink">{user.name}</p>
                                                <p className="text-xs text-gray-400">ID: #{user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-gray-400" />
                                            <span className="text-gray-600">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                            {getRoleIcon(user.role)}
                                            {user.role === 'admin' ? 'Admin' : user.role === 'dean' ? 'Dean' : 'Secretary'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-gray-500">
                                            {user.faculty_name || '—'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Calendar size={14} />
                                            <span className="text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="rounded-lg p-1.5 text-blue-600 transition-all hover:bg-blue-50 hover:scale-110"
                                                title="Edit User"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                className="rounded-lg p-1.5 text-red-600 transition-all hover:bg-red-50 hover:scale-110"
                                                title="Delete User"
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
                
                {users.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                            <UserCog size={40} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-500">No users found</p>
                        <p className="mt-1 text-sm text-gray-400">
                            {filters.search || filters.role ? 'Try adjusting your filters' : 'Click "Add User" to create your first user'}
                        </p>
                        {(filters.search || filters.role) && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-sm text-ccs-orange hover:underline"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
                
                <Pagination />
            </div>

            {/* Stats Summary */}
            {users.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Users size={16} />
                            <span className="text-xs font-medium">Total Users</span>
                        </div>
                        <p className="mt-1 text-xl font-bold text-ccs-ink">{pagination.total}</p>
                    </div>
                    <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-3">
                        <div className="flex items-center gap-2 text-red-600">
                            <Shield size={16} />
                            <span className="text-xs font-medium">Admins</span>
                        </div>
                        <p className="mt-1 text-xl font-bold text-ccs-ink">
                            {users.filter(u => u.role === 'admin').length}
                        </p>
                    </div>
                    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3">
                        <div className="flex items-center gap-2 text-blue-600">
                            <UserCog size={16} />
                            <span className="text-xs font-medium">Deans</span>
                        </div>
                        <p className="mt-1 text-xl font-bold text-ccs-ink">
                            {users.filter(u => u.role === 'dean').length}
                        </p>
                    </div>
                    <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <Users size={16} />
                            <span className="text-xs font-medium">Secretaries</span>
                        </div>
                        <p className="mt-1 text-xl font-bold text-ccs-ink">
                            {users.filter(u => u.role === 'secretary').length}
                        </p>
                    </div>
                </div>
            )}

            {/* User Form Modal */}
            <UserFormModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setSelectedUser(null)
                }}
                onSave={handleSaveUser}
                user={selectedUser}
                faculties={faculties}
                roleOptions={roleOptions}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false)
                    setSelectedUser(null)
                }}
                onConfirm={handleDeleteConfirm}
                user={selectedUser}
            />
        </div>
    )
}