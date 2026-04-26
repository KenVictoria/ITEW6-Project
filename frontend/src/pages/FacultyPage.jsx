import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../hooks/useApi'
import { 
  Plus, Search, Edit2, Trash2, X, Filter, Users, 
  Mail, IdCard, Building2, Sparkles, ChevronDown, 
  Loader2, UserPlus, BookOpen, Award, Calendar
} from 'lucide-react'

const empty = { name: '', email: '', employee_id: '', department: 'BSIT' }

export function FacultyPage() {
  const [faculties, setFaculties] = useState([])
  const [filteredFaculties, setFilteredFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState('create')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/faculties')
      setFaculties(Array.isArray(data) ? data : [])
      setFilteredFaculties(Array.isArray(data) ? data : [])
    } catch {
      setFaculties([])
      setFilteredFaculties([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Filter faculties based on search and department
  useEffect(() => {
    let filtered = [...faculties]
    
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (departmentFilter) {
      filtered = filtered.filter(f => f.department === departmentFilter)
    }
    
    setFilteredFaculties(filtered)
  }, [searchTerm, departmentFilter, faculties])

  function openCreate() {
    setMode('create')
    setEditing(null)
    setForm(empty)
    setError('')
    setModalOpen(true)
  }

  function openEdit(f) {
    setMode('edit')
    setEditing(f)
    setForm({
      name: f.name ?? '',
      email: f.email ?? '',
      employee_id: f.employee_id ?? '',
      department: f.department ?? 'BSIT',
    })
    setError('')
    setModalOpen(true)
  }

  async function handleDelete(f) {
    setDeleteConfirm(f)
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    try {
      await api.delete(`/faculties/${deleteConfirm.id}`)
      await load()
      setDeleteConfirm(null)
    } catch {
      alert('Could not delete faculty (they may have schedules).')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      employee_id: form.employee_id.trim(),
      department: form.department,
    }
    try {
      if (mode === 'create') {
        await api.post('/faculties', payload)
      } else {
        await api.put(`/faculties/${editing.id}`, payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      const d = err.response?.data
      setError(
        d?.message || (d?.errors && Object.values(d.errors).flat().join(' ')) || 'Save failed',
      )
    } finally {
      setSaving(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDepartmentFilter('')
  }

  const getDepartmentBadgeColor = (dept) => {
    return dept === 'BSIT' 
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
  }

  if (loading && faculties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-ccs-orange"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="h-6 w-6 text-ccs-orange animate-pulse" />
          </div>
        </div>
        <p className="text-ccs-muted animate-pulse">Loading faculty members...</p>
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
                <Award className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-ccs-ink">Faculty Management</h1>
            </div>
            <p className="text-ccs-muted">
              Manage instructors and staff records for the CCS department.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <UserPlus size={18} className="transition-transform group-hover:scale-110" />
            Add Faculty
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-ccs-orange" />
            <h3 className="font-semibold text-ccs-ink">Filters</h3>
            {(searchTerm || departmentFilter) && (
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
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
            >
              <option value="">All Departments</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {filteredFaculties.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-3">
            <div className="flex items-center gap-2 text-orange-600">
              <Users size={16} />
              <span className="text-xs font-medium">Total Faculty</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{filteredFaculties.length}</p>
          </div>
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3">
            <div className="flex items-center gap-2 text-blue-600">
              <BookOpen size={16} />
              <span className="text-xs font-medium">BSIT Faculty</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">
              {filteredFaculties.filter(f => f.department === 'BSIT').length}
            </p>
          </div>
          <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3">
            <div className="flex items-center gap-2 text-purple-600">
              <BookOpen size={16} />
              <span className="text-xs font-medium">BSCS Faculty</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">
              {filteredFaculties.filter(f => f.department === 'BSCS').length}
            </p>
          </div>
          <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3">
            <div className="flex items-center gap-2 text-green-600">
              <Calendar size={16} />
              <span className="text-xs font-medium">Active Faculty</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{filteredFaculties.length}</p>
          </div>
        </div>
      )}

      {/* Faculty Table */}
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Faculty</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Email</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Employee ID</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Department</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculties.map((f, idx) => (
                <motion.tr
                  key={f.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-gray-100 transition-colors hover:bg-orange-50/40 group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100 font-semibold text-ccs-orange">
                        {f.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-ccs-ink">{f.name}</p>
                        <p className="text-xs text-gray-400">ID: {f.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-gray-600">{f.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <IdCard size={14} className="text-gray-400" />
                      <span className="font-mono text-sm text-gray-600">{f.employee_id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getDepartmentBadgeColor(f.department)}`}>
                      <Building2 size={12} className="mr-1" />
                      {f.department}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(f)}
                        className="rounded-lg p-1.5 text-blue-600 transition-all hover:bg-blue-50 hover:scale-110"
                        title="Edit Faculty"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(f)}
                        className="rounded-lg p-1.5 text-red-600 transition-all hover:bg-red-50 hover:scale-110"
                        title="Delete Faculty"
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
        
        {filteredFaculties.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Users size={40} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">No faculty members found</p>
            <p className="mt-1 text-sm text-gray-400">
              {searchTerm || departmentFilter ? 'Try adjusting your filters' : 'Click "Add Faculty" to get started'}
            </p>
            {(searchTerm || departmentFilter) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-ccs-orange hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Faculty Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-ccs-orange/10 to-orange-50 p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-ccs-ink">
                      {mode === 'create' ? 'Add Faculty' : 'Edit Faculty'}
                    </h2>
                    <p className="text-sm text-ccs-muted mt-1">
                      {mode === 'create' ? 'Add a new faculty member to the system' : 'Update faculty information'}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                    <div className="mt-0.5">⚠️</div>
                    <div>{error}</div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    placeholder="e.g., John Michael Santos"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="e.g., john.santos@ccs.edu.ph"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Employee ID *
                  </label>
                  <input
                    required
                    placeholder="e.g., FAC-2024-001"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 font-mono text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.employee_id}
                    onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Department *
                  </label>
                  <select
                    required
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  >
                    <option value="BSIT">BSIT - Bachelor of Science in Information Technology</option>
                    <option value="BSCS">BSCS - Bachelor of Science in Computer Science</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      mode === 'create' ? 'Add Faculty' : 'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => setDeleteConfirm(null)}
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
                    <h3 className="text-lg font-semibold text-red-800">Delete Faculty</h3>
                    <p className="text-sm text-red-600">Confirm faculty removal</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This action will permanently delete the faculty record from the system.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100 font-semibold text-ccs-orange">
                      {deleteConfirm.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Faculty to remove:</p>
                      <p className="text-base font-semibold text-ccs-ink">{deleteConfirm.name}</p>
                      <p className="text-xs text-gray-500">{deleteConfirm.department}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 p-5 border-t bg-gray-50">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Faculty
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}