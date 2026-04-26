import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../hooks/useApi'
import { StudentViewSwitcher } from '../components/students/StudentViewSwitcher'
import { 
  Users, Search, Filter, X, ChevronDown, FileText, 
  GraduationCap, BookOpen, Award, TrendingUp, Loader2,
  Download, Eye, AlertCircle, CheckCircle, Sparkles
} from 'lucide-react'

export function StudentDirectoryPage() {
  const [students, setStudents] = useState([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    has_more_pages: false
  })
  const [meta, setMeta] = useState({ 
    skills: [], 
    grade_remarks: [], 
    departments: [],
    affiliations: [],
    violations: []
  })
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    skill: '',
    grade_remarks: '',
    department: '',
    hobby: '',
    affiliation: '',
    has_violations: '',
    year_level: '',
  })

  const loadStudents = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v != null),
      )
      params.page = page
      params.per_page = pagination.per_page
      
      const { data } = await api.get('/students', { params })
      
      setStudents(data.data || [])
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 15,
        total: data.total || 0,
        has_more_pages: data.current_page < data.last_page
      })
    } catch (error) {
      console.error('Failed to load students:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.per_page])

  const loadMeta = useCallback(async () => {
    try {
      const { data } = await api.get('/reports/students/meta')
      setMeta({
        skills: data.skills || [],
        grade_remarks: data.grade_remarks || [],
        departments: data.departments || [],
        affiliations: data.affiliations || [],
        violations: data.violations || []
      })
    } catch {
      try {
        const { data } = await api.get('/students/filter-options')
        setMeta({
          skills: data.skills || [],
          grade_remarks: data.grade_remarks || [],
          departments: data.departments || [],
          affiliations: data.affiliations || [],
          violations: data.violations || []
        })
      } catch {
        setMeta({
          skills: [],
          grade_remarks: [],
          departments: [],
          affiliations: [],
          violations: []
        })
      }
    }
  }, [])

  useEffect(() => {
    loadStudents(1)
  }, [loadStudents])

  useEffect(() => {
    loadMeta()
  }, [loadMeta])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      loadStudents(newPage)
    }
  }

  const handlePerPageChange = (newPerPage) => {
    setPagination(prev => ({ ...prev, per_page: newPerPage }))
    setTimeout(() => loadStudents(1), 0)
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      skill: '',
      grade_remarks: '',
      department: '',
      hobby: '',
      affiliation: '',
      has_violations: '',
      year_level: '',
    })
  }

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: '' }))
  }

  async function downloadPdf() {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    const url = `${api.defaults.baseURL}/reports/students/pdf?${params.toString()}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/pdf',
        Authorization: api.defaults.headers.common.Authorization || '',
      },
    })
    if (!res.ok) throw new Error('PDF failed')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ccs-student-report.pdf'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== null)

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
        <p className="text-ccs-muted animate-pulse">Loading student directory...</p>
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
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-ccs-ink">Student Directory</h1>
            </div>
            <p className="text-ccs-muted">
              Search and browse student profiles (read-only). Export matches to PDF. Records are maintained by the secretary.
            </p>
          </div>
          <div className="flex gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="group flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-2 text-ccs-ink transition-all hover:border-ccs-orange/50 hover:bg-white hover:shadow-md"
              >
                <X size={16} />
                Reset Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => downloadPdf().catch(() => alert('Could not generate PDF'))}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <Download size={18} className="transition-transform group-hover:scale-110" />
              Export to PDF
            </button>
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
              <FileText size={16} />
              <span className="text-xs font-medium">Pages</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{pagination.last_page}</p>
          </div>
        </div>
      )}

      {/* Filters Card */}
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-ccs-orange" />
            <h3 className="font-semibold text-ccs-ink">Search & Filters</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center rounded-full bg-ccs-orange/10 px-2 py-0.5 text-xs font-medium text-ccs-orange">
                Filters active
              </span>
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
          {/* Search - Full width on mobile */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ccs-orange" size={18} />
              <input
                className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                placeholder="Search by name, email, or student ID..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
          </div>

          {/* Department */}
          <div className="w-full md:w-40">
            <select
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
              value={filters.department}
              onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
            >
              <option value="">All Departments</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
              {meta.departments
                ?.filter((d) => d && !['BSIT', 'BSCS'].includes(d))
                .map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
            </select>
          </div>

          {/* Year Level */}
          <div className="w-full md:w-36">
            <select
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
              value={filters.year_level}
              onChange={(e) => setFilters((f) => ({ ...f, year_level: e.target.value }))}
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Grade Remarks */}
          <div className="w-full md:w-44">
            <select
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
              value={filters.grade_remarks}
              onChange={(e) => setFilters((f) => ({ ...f, grade_remarks: e.target.value }))}
            >
              <option value="">All Remarks</option>
              {meta.grade_remarks.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Skill */}
          <div className="w-full md:w-40">
            <select
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
              value={filters.skill}
              onChange={(e) => setFilters((f) => ({ ...f, skill: e.target.value }))}
            >
              <option value="">All Skills</option>
              {meta.skills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Affiliation */}
          <div className="w-full md:w-44">
            <select
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
              value={filters.affiliation}
              onChange={(e) => setFilters((f) => ({ ...f, affiliation: e.target.value }))}
            >
              <option value="">All Affiliations</option>
              {meta.affiliations.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Violations */}
          <div className="w-full md:w-44">
            <select
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
              value={filters.has_violations}
              onChange={(e) => setFilters((f) => ({ ...f, has_violations: e.target.value }))}
            >
              <option value="">All Students</option>
              <option value="yes">With Violations</option>
              <option value="no">No Violations</option>
            </select>
          </div>

          {/* Hobby */}
          <div className="w-full md:w-48">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ccs-orange" size={18} />
              <input
                className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                placeholder="Search by hobby..."
                value={filters.hobby}
                onChange={(e) => setFilters((f) => ({ ...f, hobby: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t-2 border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                🔍 Search: {filters.search}
                <button onClick={() => removeFilter('search')} className="ml-1 hover:text-blue-900">×</button>
              </span>
            )}
            {filters.department && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                📚 Dept: {filters.department}
                <button onClick={() => removeFilter('department')} className="ml-1 hover:text-orange-900">×</button>
              </span>
            )}
            {filters.year_level && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                🎓 Year: {filters.year_level}
                <button onClick={() => removeFilter('year_level')} className="ml-1 hover:text-purple-900">×</button>
              </span>
            )}
            {filters.grade_remarks && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                ⭐ Remarks: {filters.grade_remarks}
                <button onClick={() => removeFilter('grade_remarks')} className="ml-1 hover:text-green-900">×</button>
              </span>
            )}
            {filters.skill && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-1 text-xs text-teal-700">
                💻 Skill: {filters.skill}
                <button onClick={() => removeFilter('skill')} className="ml-1 hover:text-teal-900">×</button>
              </span>
            )}
            {filters.affiliation && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700">
                🤝 Affiliation: {filters.affiliation}
                <button onClick={() => removeFilter('affiliation')} className="ml-1 hover:text-indigo-900">×</button>
              </span>
            )}
            {filters.has_violations && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                ⚠️ Violations: {filters.has_violations === 'yes' ? 'Has Violations' : 'No Violations'}
                <button onClick={() => removeFilter('has_violations')} className="ml-1 hover:text-red-900">×</button>
              </span>
            )}
            {filters.hobby && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-1 text-xs text-pink-700">
                🎨 Hobby: {filters.hobby}
                <button onClick={() => removeFilter('hobby')} className="ml-1 hover:text-pink-900">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Student View Switcher */}
      <StudentViewSwitcher 
        students={students} 
        loading={loading} 
        pagination={pagination}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />

      {/* Empty State */}
      {!loading && students.length === 0 && (
        <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-12 text-center shadow-md">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Users size={40} className="text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-500">No students found</p>
          <p className="mt-1 text-sm text-gray-400">
            {hasActiveFilters ? 'Try adjusting your filters' : 'No student records available'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="mt-4 text-sm text-ccs-orange hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}