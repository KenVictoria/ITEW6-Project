// src/components/students/StudentListView.jsx
import { motion } from 'framer-motion'
import { ChevronRight, AlertCircle, Edit2, Trash2 } from 'lucide-react'

export default function StudentListView({ students, loading, onEdit, onDelete, canEdit, canDelete }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
        <div className="text-gray-400">No students found</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {students.map((student, idx) => (
        <motion.div
          key={student.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.03 }}
          whileHover={{ x: 4 }}
          className="group bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-200"
        >
          <div className="p-4 flex items-center justify-between flex-wrap gap-4">
            {/* Left Section - Name and ID */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {student.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">{student.student_id}</p>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-1.5">
                {student.skills?.slice(0, 3).map((skill, i) => (
                  <span key={i} className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
                {student.skills?.length > 3 && (
                  <span className="text-xs text-gray-400">+{student.skills.length - 3}</span>
                )}
              </div>
            </div>

            {/* Department and Remarks */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">{student.department}</div>
                <div className="text-xs text-gray-500">{student.grade_remarks || 'N/A'}</div>
              </div>
              
              {student.violations && (
                <div className="flex items-center gap-1 text-red-500">
                  <AlertCircle size={14} />
                  <span className="text-xs font-medium">Violation</span>
                </div>
              )}
              
              <div className="flex gap-1">
                {canEdit && onEdit && (
                  <button
                    onClick={() => onEdit(student)}
                    className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                    title="Edit Student"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                {canDelete && onDelete && (
                  <button
                    onClick={() => onDelete(student)}
                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                    title="Delete Student"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}