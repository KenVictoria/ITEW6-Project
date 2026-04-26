// src/components/students/StudentTableView.jsx
import { motion } from 'framer-motion'
import { Edit2, Trash2, AlertCircle } from 'lucide-react'

export default function StudentTableView({ students, loading, onEdit, onDelete, canEdit, canDelete }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="h-12 bg-gray-100"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white border-t border-gray-100"></div>
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Student ID</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Name</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Department</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Skills</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Hobby</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Remarks</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Violations</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors"
              >
                <td className="p-4 text-sm font-mono text-gray-500">{student.student_id}</td>
                <td className="p-4">
                  <span className="font-medium text-gray-800">{student.name}</span>
                </td>
                <td className="p-4 text-sm text-gray-600">{student.email}</td>
                <td className="p-4">
                  <span className="text-sm text-gray-600">{student.department}</span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {student.skills?.slice(0, 2).map((skill, i) => (
                      <span key={i} className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                    {student.skills?.length > 2 && (
                      <span className="text-xs text-gray-400">+{student.skills.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">{student.hobby || '—'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.grade_remarks === 'Failed' ? 'bg-red-100 text-red-700' : 
                    student.grade_remarks === 'Excellent' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {student.grade_remarks || '—'}
                  </span>
                </td>
                <td className="p-4">
                  {student.violations ? (
                    <div className="flex items-center gap-1 text-red-500">
                      <AlertCircle size={14} />
                      <span className="text-xs">Yes</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {canEdit && onEdit && (
                      <button
                        onClick={() => onEdit(student)}
                        className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                        title="Edit Student"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDelete && onDelete && (
                      <button
                        onClick={() => onDelete(student)}
                        className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50"
                        title="Delete Student"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {(!canEdit && !canDelete) && (
                      <span className="text-xs text-gray-400">Read only</span>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}