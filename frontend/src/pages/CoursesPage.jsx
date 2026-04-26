import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../hooks/useApi'
import { 
  BookOpen, Plus, Search, Edit2, Trash2, X, Filter, 
  BookMarked, Sparkles, Loader2, ChevronDown, 
  CheckCircle, AlertCircle, GraduationCap, Layers,
  TrendingUp, Award, Library, Info
} from 'lucide-react'

const empty = {
  code: '',
  title: '',
  department: 'BSIT',
  units: '3',
  curriculum: 'Curriculum Year 2026',
  semester: '1',
  yearLevel: '1',
}

export function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState('create')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [curriculumFilter, setCurriculumFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/courses')
      setCourses(Array.isArray(data) ? data : [])
      setFilteredCourses(Array.isArray(data) ? data : [])
    } catch {
      setCourses([])
      setFilteredCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Filter courses based on search, department, and curriculum
  useEffect(() => {
    let filtered = [...courses]
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (departmentFilter) {
      filtered = filtered.filter(c => c.department === departmentFilter)
    }

    if (curriculumFilter) {
      filtered = filtered.filter(c => c.curriculum === curriculumFilter)
    }
    
    setFilteredCourses(filtered)
  }, [searchTerm, departmentFilter, curriculumFilter, courses])

  function openCreate() {
    setMode('create')
    setEditing(null)
    setForm(empty)
    setError('')
    setModalOpen(true)
  }

  function openEdit(c) {
    setMode('edit')
    setEditing(c)
    setForm({
      code: c.code ?? '',
      title: c.title ?? '',
      department: c.department ?? 'BSIT',
      units: c.units != null ? String(c.units) : '3',
      curriculum: c.curriculum ?? 'Curriculum Year 2026',
      semester: c.semester != null ? String(c.semester) : '1',
      yearLevel: c.year_level != null ? String(c.year_level) : '1',
    })
    setError('')
    setModalOpen(true)
  }

  async function handleDelete(c) {
    setDeleteConfirm(c)
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    try {
      await api.delete(`/courses/${deleteConfirm.id}`)
      await load()
      setDeleteConfirm(null)
    } catch {
      alert('Could not delete course (it may have sections or schedules).')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      department: form.department,
      units: form.units === '' ? null : parseInt(form.units, 10),
      curriculum: form.curriculum.trim(),
      semester: parseInt(form.semester, 10),
      year_level: parseInt(form.yearLevel, 10),
    }
    try {
      if (mode === 'create') {
        await api.post('/courses', payload)
      } else {
        await api.put(`/courses/${editing.id}`, payload)
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
    setCurriculumFilter('')
  }

  const hasActiveFilters = searchTerm || departmentFilter || curriculumFilter
  const curriculumOptions = [...new Set(courses.map((c) => c.curriculum).filter(Boolean))]

  // Calculate stats
  const totalCourses = filteredCourses.length
  const bsitCount = filteredCourses.filter(c => c.department === 'BSIT').length
  const bscsCount = filteredCourses.filter(c => c.department === 'BSCS').length
  const totalUnits = filteredCourses.reduce((sum, c) => sum + (c.units || 0), 0)

  // Loading animation
  if (loading && courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-ccs-orange"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-ccs-orange animate-pulse" />
          </div>
        </div>
        <p className="text-ccs-muted animate-pulse">Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ccs-orange/10 via-white to-orange-50/30 p-6">
        <div className="absolute top-0 right-0 opacity-10">
          <BookOpen size={120} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-ccs-orange to-orange-600 p-2 shadow-lg shadow-orange-200">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-ccs-ink">Course Management</h1>
            </div>
            <p className="text-ccs-muted">
              Maintain course catalog for BSIT and BSCS programs. Create, update, and manage course offerings.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Plus size={18} className="transition-transform group-hover:scale-110" />
            Add Course
          </button>
        </div>
      </div>

      {/* Stats Summary with Pop Animation */}
      {courses.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
            className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-blue-600">
              <BookOpen size={16} />
              <span className="text-xs font-medium">Total Courses</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{totalCourses}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-orange-600">
              <GraduationCap size={16} />
              <span className="text-xs font-medium">BSIT Courses</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{bsitCount}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
            className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-purple-600">
              <GraduationCap size={16} />
              <span className="text-xs font-medium">BSCS Courses</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{bscsCount}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
            className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp size={16} />
              <span className="text-xs font-medium">Total Units</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{totalUnits}</p>
          </motion.div>
        </div>
      )}

      {/* Filters Card with Pop Animation */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-4 shadow-md"
      >
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
        
        <div className={`flex flex-wrap gap-4 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex-1 min-w-[200px]">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ccs-orange" size={18} />
              <input
                type="text"
                placeholder="Search by course code or title..."
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
          <div className="w-full md:w-56">
            <select
              value={curriculumFilter}
              onChange={(e) => setCurriculumFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
            >
              <option value="">All Curricula</option>
              {curriculumOptions.map((curriculum) => (
                <option key={curriculum} value={curriculum}>
                  {curriculum}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Courses Table with Pop Animation */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 overflow-hidden shadow-md"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Course</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Code</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Department</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Curriculum</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Year / Sem</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Units</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Status</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((c, idx) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (idx * 0.02), duration: 0.3 }}
                  className="border-b border-gray-100 transition-colors hover:bg-orange-50/40 group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100">
                        <BookOpen className="h-5 w-5 text-ccs-orange" />
                      </div>
                      <div>
                        <p className="font-semibold text-ccs-ink">{c.title}</p>
                        <p className="text-xs text-gray-400">ID: {c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-gray-700">
                      {c.code}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      c.department === 'BSIT' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {c.department === 'BSIT' ? 'BSIT' : 'BSCS'}
                    </span>
                   </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-ccs-ink">{c.curriculum || '—'}</span>
                   </td>
                  <td className="p-4">
                    <span className="text-sm text-ccs-ink">
                      {c.year_level ? `Year ${c.year_level}` : '—'} / {c.semester ? `Sem ${c.semester}` : '—'}
                    </span>
                   </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-gray-400" />
                      <span className="font-semibold text-ccs-ink">{c.units || '—'}</span>
                      {c.units && (
                        <span className="text-xs text-gray-400">unit{c.units !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                   </td>
                  <td className="p-4">
                    {c.units ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                        <AlertCircle size={12} />
                        No Units
                      </span>
                    )}
                   </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="rounded-lg p-1.5 text-blue-600 transition-all hover:bg-blue-50 hover:scale-110"
                        title="Edit Course"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="rounded-lg p-1.5 text-red-600 transition-all hover:bg-red-50 hover:scale-110"
                        title="Delete Course"
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
        
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="py-16 text-center"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <BookOpen size={40} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">No courses found</p>
            <p className="mt-1 text-sm text-gray-400">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Click "Add Course" to get started'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-ccs-orange hover:underline"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Course Form Modal */}
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
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-ccs-orange/10 to-orange-50 p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-ccs-ink">
                      {mode === 'create' ? 'Add Course' : 'Edit Course'}
                    </h2>
                    <p className="text-sm text-ccs-muted mt-1">
                      {mode === 'create' ? 'Add a new course to the catalog' : 'Update course information'}
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
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>{error}</div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Course Code *
                  </label>
                  <input
                    required
                    placeholder="e.g., IT 101"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 font-mono text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Course Title *
                  </label>
                  <input
                    required
                    placeholder="e.g., Introduction to Programming"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Units *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    placeholder="e.g., 3"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.units}
                    onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Curriculum *
                  </label>
                  <input
                    required
                    placeholder="e.g., Curriculum Year 2026"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.curriculum}
                    onChange={(e) => setForm((f) => ({ ...f, curriculum: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-ccs-ink mb-1">
                      Year Level *
                    </label>
                    <select
                      required
                      className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                      value={form.yearLevel}
                      onChange={(e) => setForm((f) => ({ ...f, yearLevel: e.target.value }))}
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ccs-ink mb-1">
                      Semester *
                    </label>
                    <select
                      required
                      className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                      value={form.semester}
                      onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                    >
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                    </select>
                  </div>
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
                      mode === 'create' ? 'Add Course' : 'Save Changes'
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
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="bg-red-50 p-5 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Delete Course</h3>
                    <p className="text-sm text-red-600">Confirm course removal</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This action will permanently delete the course from the system. This cannot be undone and may affect sections and schedules.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100">
                      <BookOpen className="h-6 w-6 text-ccs-orange" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Course to remove:</p>
                      <p className="text-base font-semibold text-ccs-ink">{deleteConfirm.title}</p>
                      <p className="text-xs text-gray-500">Code: {deleteConfirm.code} • {deleteConfirm.department} • {deleteConfirm.units} units</p>
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
                  Delete Course
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}