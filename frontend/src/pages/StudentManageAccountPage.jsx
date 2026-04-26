import { useEffect, useState } from 'react'
import { Lock, Save, Eye, User, Mail, Users, Code, Heart, GraduationCap, AlertTriangle } from 'lucide-react'
import { api } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'

function parseTagInput(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toTagInput(value) {
  return Array.isArray(value) ? value.join(', ') : ''
}

export function StudentManageAccountPage() {
  const { user, updateCurrentUser } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    student_id: '',
    department: 'BSIT',
    affiliations: '',
    skills: '',
    hobby: '',
    grade_remarks: '',
    violations: '',
    password: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      student_id: user?.student_id || '',
      department: user?.department || 'BSIT',
      affiliations: toTagInput(user?.affiliations),
      skills: toTagInput(user?.skills),
      hobby: user?.hobby || '',
      grade_remarks: user?.grade_remarks || '',
      violations: user?.violations || '',
      password: '',
    })
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      affiliations: parseTagInput(form.affiliations),
      skills: parseTagInput(form.skills),
      hobby: form.hobby.trim() || null,
    }

    if (form.password.trim()) {
      payload.password = form.password.trim()
    }

    try {
      const { data } = await api.put('/student/account', payload)
      updateCurrentUser(data)
      setForm((prev) => ({ ...prev, password: '' }))
      setMessage('Account updated successfully.')
    } catch (err) {
      const d = err.response?.data
      setError(d?.message || (d?.errors && Object.values(d.errors).flat().join(' ')) || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-ccs-orange/10 via-white to-orange-50/30 p-6">
        <h1 className="text-3xl font-bold text-ccs-ink">Manage Account</h1>
        <p className="text-ccs-muted">Update your profile information and password.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm space-y-4">
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {message ? <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div> : null}

        {/* Editable Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ccs-ink">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={form.name} 
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-ccs-orange" 
                required 
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ccs-ink">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} 
                className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-ccs-orange" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Read-only Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ccs-ink">Student ID</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <GraduationCap size={14} className="text-gray-400" />
              </div>
              <input 
                value={form.student_id} 
                disabled 
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-600 cursor-not-allowed" 
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Student ID cannot be changed</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ccs-ink">Department</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Users size={14} className="text-gray-400" />
              </div>
              <select 
                value={form.department} 
                disabled
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-600 cursor-not-allowed"
              >
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-400">Department is assigned and cannot be changed</p>
          </div>
        </div>

        {/* Affiliations & Skills - Editable */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ccs-ink">Affiliations (comma-separated)</label>
          <div className="relative">
            <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={form.affiliations} 
              onChange={(e) => setForm((f) => ({ ...f, affiliations: e.target.value }))} 
              className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-ccs-orange" 
              placeholder="e.g., Google Developers Club, ACM, IEEE"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ccs-ink">Skills (comma-separated)</label>
          <div className="relative">
            <Code size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={form.skills} 
              onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} 
              className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-ccs-orange" 
              placeholder="e.g., JavaScript, Python, React, Node.js"
            />
          </div>
        </div>

        {/* Hobby - Editable */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ccs-ink">Hobby / Interests</label>
          <div className="relative">
            <Heart size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={form.hobby} 
              onChange={(e) => setForm((f) => ({ ...f, hobby: e.target.value }))} 
              className="w-full rounded-xl border-2 border-gray-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-ccs-orange" 
              placeholder="e.g., Reading, Gaming, Sports, Music"
            />
          </div>
        </div>

        {/* Read-only Academic Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ccs-ink">Grade Remarks</label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                <GraduationCap size={14} className="text-gray-400" />
              </div>
              <textarea 
                rows={3} 
                value={form.grade_remarks || 'No grade remarks available'} 
                disabled 
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-600 cursor-not-allowed resize-none" 
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Grade remarks are managed by the admin</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ccs-ink">Violations Record</label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                <AlertTriangle size={14} className="text-gray-400" />
              </div>
              <textarea 
                rows={3} 
                value={form.violations || 'No violations record'} 
                disabled 
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-600 cursor-not-allowed resize-none" 
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Violations are recorded by the admin</p>
          </div>
        </div>

        {/* Password Field - Editable */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ccs-ink">New Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Leave blank to keep current password"
              className="w-full rounded-xl border-2 border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-ccs-orange"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">Enter a new password only if you want to change it</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ccs-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-ccs-orange-dark disabled:opacity-60 transition-all"
        >
          <Save size={15} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}