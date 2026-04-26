import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../hooks/useApi'
import { StudentViewSwitcher } from '../components/students/StudentViewSwitcher'
import { StudentFormModal } from '../components/students/StudentFormModal'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { 
  Users, Search, Filter, X, ChevronDown, Sparkles, 
  RefreshCw, UserPlus, GraduationCap, BookOpen, 
  Award, TrendingUp, Loader2, Eye, Edit2, Trash2
} from 'lucide-react'

export function StudentsPage() {
  const { user, hasRole } = useAuth()
  const [students, setStudents] = useState([])
  const [meta, setMeta] = useState({ skills: [], grade_remarks: [], departments: [] })
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    skill: '',
    grade_remarks: '',
    department: '',
    hobby: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [editingStudent, setEditingStudent] = useState(null)

  // Check if user has edit permissions (only secretary)
  const canEdit = hasRole('secretary')
  const canDelete = hasRole('secretary')
  const canCreate = hasRole('secretary')

  const loadStudents = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v != null),
      )
      params.page = page
      params.per_page = pagination.per_page
      const { data } = await api.get('/students', { params })
      setStudents(data.data || data || [])
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 15,
        total: data.total || 0
      })
    } catch (error) {
      console.error('Failed to load students:', error)
      toast.error('Failed to load students')
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.per_page])

  const loadFilterOptions = useCallback(async () => {
    try {
      const { data } = await api.get('/students/filter-options')
      setMeta(data)
    } catch (error) {
      console.error('Failed to load filter options:', error)
    }
  }, [])

  useEffect(() => {
    loadStudents(1)
  }, [loadStudents])

  useEffect(() => {
    loadFilterOptions()
  }, [loadFilterOptions])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      loadStudents(newPage)
    }
  }

  const handlePerPageChange = (newPerPage) => {
    setPagination(prev => ({ ...prev, per_page: newPerPage, current_page: 1 }))
    loadStudents(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      skill: '',
      grade_remarks: '',
      department: '',
      hobby: '',
    })
  }

  const hasActiveFilters = filters.search || filters.skill || filters.grade_remarks || filters.department || filters.hobby

  function openCreate() {
    if (!canCreate) {
      toast.error('You do not have permission to add students')
      return
    }
    setFormMode('create')
    setEditingStudent(null)
    setFormOpen(true)
  }

  function openEdit(student) {
    if (!canEdit) {
      toast.error('You do not have permission to edit students')
      return
    }
    setFormMode('edit')
    setEditingStudent(student)
    setFormOpen(true)
  }

  async function handleDelete(student) {
    if (!canDelete) {
      toast.error('You do not have permission to delete students')
      return
    }
    
    if (!window.confirm(`Delete student "${student.name}" (${student.student_id})? This action cannot be undone.`)) {
      return
    }
    try {
      await api.delete(`/students/${student.id}`)
      toast.success('Student deleted successfully')
      await loadStudents(pagination.current_page)
      await loadFilterOptions()
    } catch (error) {
      console.error('Failed to delete student:', error)
      toast.error(error.response?.data?.message || 'Could not delete student.')
    }
  }

  async function handleSaved(payload, mode, student) {
    try {
      if (mode === 'create') {
        await api.post('/students', payload)
        toast.success('Student created successfully')
      } else {
        await api.put(`/students/${student.id}`, payload)
        toast.success('Student updated successfully')
      }
      await loadStudents(pagination.current_page)
      await loadFilterOptions()
      setFormOpen(false)
      setEditingStudent(null)
    } catch (error) {
      console.error('Failed to save student:', error)
      toast.error(error.response?.data?.message || 'Failed to save student')
      throw error
    }
  }

  const handleRefresh = () => {
    loadStudents(pagination.current_page)
    loadFilterOptions()
    toast.success('Data refreshed')
  }

  // Calculate stats
  const totalStudents = pagination.total
  const departmentCount = students.reduce((acc, student) => {
    acc[student.department] = (acc[student.department] || 0) + 1
    return acc
  }, {})
  const bsitCount = departmentCount.BSIT || 0
  const bscsCount = departmentCount.BSCS || 0

  if (loading && students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-ccs-orange"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-ccs-orange animate-pulse" />
          </div>
        </div>
        <p className="text-ccs-muted animate-pulse">Loading student records...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ccs-orange/10 via-white to-orange-50/30 p-6">
        <div className="absolute top-0 right-0 opacity-10">
          <GraduationCap size={120} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-ccs-orange to-orange-600 p-2 shadow-lg shadow-orange-200">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-ccs-ink">Student Management</h1>
            </div>
            <p className="text-ccs-muted">
              {canCreate ? 'Create, update, and remove student profiles.' : 'View student profiles (read-only).'}
              Switch between table, list, and card layouts.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="group flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 text-ccs-ink transition-all hover:border-ccs-orange/50 hover:bg-white hover:shadow-md"
            >
              <RefreshCw size={16} className="transition-transform group-hover:rotate-180" />
              Refresh
            </button>
            {canCreate && (
              <button
                type="button"
                onClick={openCreate}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <UserPlus size={18} className="transition-transform group-hover:scale-110" />
                Add Student
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-md">
            <div className="flex items-center gap-2 text-blue-600">
              <Users size={16} />
              <span className="text-xs font-medium">Total Students</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{totalStudents}</p>
          </div>
          <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-3 shadow-md">
            <div className="flex items-center gap-2 text-orange-600">
              <BookOpen size={16} />
              <span className="text-xs font-medium">BSIT Students</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{bsitCount}</p>
          </div>
          <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3 shadow-md">
            <div className="flex items-center gap-2 text-purple-600">
              <BookOpen size={16} />
              <span className="text-xs font-medium">BSCS Students</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{bscsCount}</p>
          </div>
          <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-md">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp size={16} />
              <span className="text-xs font-medium">Per Page</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{pagination.per_page}</p>
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-sm text-ccs-orange md:hidden"
          >
            {showFilters ? 'Hide' : 'Show'} filters
            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <div className={`${showFilters ? 'flex' : 'hidden md:flex'} flex-wrap gap-4`}>
          <div className="flex-1 min-w-[200px]">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ccs-orange" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={filters.skill}
              onChange={(e) => setFilters((f) => ({ ...f, skill: e.target.value }))}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
            >
              <option value="">All Skills</option>
              {meta.skills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              value={filters.grade_remarks}
              onChange={(e) => setFilters((f) => ({ ...f, grade_remarks: e.target.value }))}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
            >
              <option value="">All Grades</option>
              {meta.grade_remarks.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-40">
            <select
              value={filters.department}
              onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
            >
              <option value="">All Departments</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ccs-orange" size={18} />
              <input
                type="text"
                placeholder="Hobby contains..."
                value={filters.hobby}
                onChange={(e) => setFilters((f) => ({ ...f, hobby: e.target.value }))}
                className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Student View Switcher with Pagination and Permissions */}
      <StudentViewSwitcher
        students={students}
        loading={loading}
        onEdit={canEdit ? openEdit : null}
        onDelete={canDelete ? handleDelete : null}
        canEdit={canEdit}
        canDelete={canDelete}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />

      {/* Empty State */}
      {!loading && students.length === 0 && (
        <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-12 text-center shadow-md">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <GraduationCap size={40} className="text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-500">No students found</p>
          <p className="mt-1 text-sm text-gray-400">
            {hasActiveFilters ? 'Try adjusting your filters' : canCreate ? 'Click "Add Student" to get started' : 'No student records available'}
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

      {/* Student Form Modal - Only shown if user has permission */}
      {canCreate && (
        <StudentFormModal
          open={formOpen}
          mode={formMode}
          student={editingStudent}
          onClose={() => {
            setFormOpen(false)
            setEditingStudent(null)
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}