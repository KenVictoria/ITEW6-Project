// src/components/students/StudentCardView.jsx
import { motion } from 'framer-motion'
import { Award, Code, AlertCircle, Star, Edit2, Trash2 } from 'lucide-react'

export default function StudentCardView({ students, loading, onEdit, onDelete, canEdit, canDelete }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
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

  const getRemarkColor = (remark) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-700',
      'Very Good': 'bg-emerald-100 text-emerald-700',
      'Good': 'bg-blue-100 text-blue-700',
      'Satisfactory': 'bg-yellow-100 text-yellow-700',
      'Poor': 'bg-orange-100 text-orange-700',
      'Failed': 'bg-red-100 text-red-700'
    }
    return colors[remark] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {students.map((student, idx) => (
        <motion.div
          key={student.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ y: -5, boxShadow: '0 20px 25px -12px rgba(0,0,0,0.15)' }}
          className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-orange-200 transition-all duration-300"
        >
          <div className="bg-gradient-to-r from-orange-50 to-white p-5 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg group-hover:text-orange-600 transition-colors">
                  {student.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-mono">{student.student_id}</p>
              </div>
              {student.grade_remarks === 'Failed' && (
                <div className="bg-red-100 p-1.5 rounded-lg">
                  <AlertCircle className="text-red-500" size={16} />
                </div>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {student.skills?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <Code size={12} /> <span>Technical Skills</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="bg-orange-50 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                  {student.skills.length > 4 && (
                    <span className="text-xs text-gray-400">+{student.skills.length - 4}</span>
                  )}
                </div>
              </div>
            )}

            {student.affiliations?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <Award size={12} /> <span>Affiliations</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {student.affiliations.slice(0, 3).map((aff, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                      {aff}
                    </span>
                  ))}
                  {student.affiliations.length > 3 && (
                    <span className="text-xs text-gray-400">+{student.affiliations.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-50 space-y-2">
              {student.hobby && (
                <div className="flex items-center gap-2 text-xs">
                  <Star size={12} className="text-yellow-500" />
                  <span className="text-gray-600">Hobby:</span>
                  <span className="text-gray-800 font-medium">{student.hobby}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Remarks:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRemarkColor(student.grade_remarks)}`}>
                    {student.grade_remarks || 'N/A'}
                  </span>
                </div>
                
                <div className="text-xs text-gray-400">
                  {student.department}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
            <div className="flex gap-2">
              {canEdit && onEdit && (
                <button
                  onClick={() => onEdit(student)}
                  className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-100"
                  title="Edit Student"
                >
                  <Edit2 size={16} />
                </button>
              )}
              {canDelete && onDelete && (
                <button
                  onClick={() => onDelete(student)}
                  className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-100"
                  title="Delete Student"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500">{student.course?.course_code || 'N/A'}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}