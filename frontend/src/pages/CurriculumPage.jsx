import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, GraduationCap, Loader2 } from 'lucide-react'
import { api } from '../hooks/useApi'

const YEAR_LEVEL_LABELS = {
  1: '1st Year',
  2: '2nd Year',
  3: '3rd Year',
  4: '4th Year',
}

const SEMESTER_LABELS = {
  1: '1st Semester',
  2: '2nd Semester',
}

export function CurriculumPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [department, setDepartment] = useState('BSIT')
  const [curriculum, setCurriculum] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/courses')
      const list = Array.isArray(data) ? data : []
      setCourses(list)
      const availableCurricula = [...new Set(list.map((c) => c.curriculum).filter(Boolean))]
      setCurriculum((prev) =>
        prev && availableCurricula.includes(prev) ? prev : availableCurricula[0] || '',
      )
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const curricula = useMemo(
    () => [...new Set(courses.map((c) => c.curriculum).filter(Boolean))],
    [courses],
  )

  const grouped = useMemo(() => {
    const filtered = courses.filter(
      (course) =>
        course.department === department &&
        (curriculum ? course.curriculum === curriculum : true),
    )

    const result = { 1: { 1: [], 2: [] }, 2: { 1: [], 2: [] }, 3: { 1: [], 2: [] }, 4: { 1: [], 2: [] } }

    filtered.forEach((course) => {
      const y = Number(course.year_level)
      const s = Number(course.semester)
      if (result[y] && result[y][s]) {
        result[y][s].push(course)
      }
    })

    Object.values(result).forEach((yearGroup) => {
      Object.values(yearGroup).forEach((semesterGroup) => {
        semesterGroup.sort((a, b) => (a.code || '').localeCompare(b.code || ''))
      })
    })

    return result
  }, [courses, curriculum, department])

  const totalUnits = useMemo(() => {
    return Object.values(grouped).reduce(
      (total, yearGroup) =>
        total +
        Object.values(yearGroup).reduce(
          (innerTotal, semesterGroup) =>
            innerTotal + semesterGroup.reduce((sum, c) => sum + (Number(c.units) || 0), 0),
          0,
        ),
      0,
    )
  }, [grouped])

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
        <p className="text-ccs-muted animate-pulse">Loading curriculum data...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ccs-ink">Curriculum Page</h1>
            <p className="text-sm text-ccs-muted">
              View courses grouped by curriculum, year level, and semester.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded-xl border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-ccs-orange"
            >
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
            </select>
            <select
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              className="rounded-xl border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-ccs-orange"
            >
              {curricula.length === 0 ? (
                <option value="">No curriculum yet</option>
              ) : (
                curricula.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-md"
        >
          <div className="flex items-center gap-2 text-blue-700">
            <BookOpen size={16} />
            <span className="text-xs font-semibold">Department</span>
          </div>
          <p className="mt-1 text-lg font-bold text-ccs-ink">{department}</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3 shadow-md"
        >
          <div className="flex items-center gap-2 text-purple-700">
            <Calendar size={16} />
            <span className="text-xs font-semibold">Curriculum</span>
          </div>
          <p className="mt-1 text-sm font-bold text-ccs-ink">{curriculum || '—'}</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-md"
        >
          <div className="flex items-center gap-2 text-green-700">
            <GraduationCap size={16} />
            <span className="text-xs font-semibold">Courses</span>
          </div>
          <p className="mt-1 text-lg font-bold text-ccs-ink">
            {Object.values(grouped).reduce(
              (acc, yearGroup) =>
                acc + Object.values(yearGroup).reduce((n, semGroup) => n + semGroup.length, 0),
              0,
            )}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-3 shadow-md"
        >
          <div className="flex items-center gap-2 text-orange-700">
            <BookOpen size={16} />
            <span className="text-xs font-semibold">Total Units</span>
          </div>
          <p className="mt-1 text-lg font-bold text-ccs-ink">{totalUnits}</p>
        </motion.div>
      </div>

      <div className="space-y-5">
        {[1, 2, 3, 4].map((yearLevel, yearIndex) => (
          <motion.div
            key={yearLevel}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + yearIndex * 0.1 }}
            className="rounded-2xl border-2 border-gray-200 bg-white shadow-md overflow-hidden"
          >
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3">
              <h2 className="font-semibold text-ccs-ink">{YEAR_LEVEL_LABELS[yearLevel]}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-2">
              {[1, 2].map((semester) => {
                const semesterCourses = grouped[yearLevel][semester]
                const semesterUnits = semesterCourses.reduce((sum, c) => sum + (Number(c.units) || 0), 0)

                return (
                  <motion.div
                    key={semester}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + yearIndex * 0.1 + semester * 0.05 }}
                    className="rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
                      <h3 className="text-sm font-semibold text-ccs-ink">{SEMESTER_LABELS[semester]}</h3>
                      <span className="text-xs font-medium text-ccs-muted">{semesterUnits} units</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs text-ccs-muted">
                            <th className="px-3 py-2 font-semibold">Course Code</th>
                            <th className="px-3 py-2 font-semibold">Course Description</th>
                            <th className="px-3 py-2 font-semibold">Units</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semesterCourses.length === 0 ? (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.7 }}
                            >
                              <td colSpan={3} className="px-3 py-8 text-center text-sm text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                  <BookOpen size={24} className="text-gray-300" />
                                  <span>No courses assigned</span>
                                </div>
                              </td>
                            </motion.tr>
                          ) : (
                            semesterCourses.map((course, courseIndex) => (
                              <motion.tr
                                key={course.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + courseIndex * 0.02 }}
                                className="border-b border-gray-50 text-sm transition-colors hover:bg-orange-50/40"
                              >
                                <td className="px-3 py-2 font-mono font-medium text-ccs-ink">{course.code}</td>
                                <td className="px-3 py-2 text-ccs-ink">{course.title}</td>
                                <td className="px-3 py-2">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                    {course.units || '—'} unit{course.units !== 1 ? 's' : ''}
                                  </span>
                                </td>
                              </motion.tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State with Animation */}
      {!loading && courses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-12 text-center shadow-md"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <BookOpen size={40} className="text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-500">No courses found</p>
          <p className="mt-1 text-sm text-gray-400">
            Add courses to see them displayed in the curriculum view
          </p>
        </motion.div>
      )}
    </div>
  )
}