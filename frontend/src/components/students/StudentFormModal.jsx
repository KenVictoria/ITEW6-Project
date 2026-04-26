import { useEffect, useState } from 'react'

const empty = {
  name: '',
  email: '',
  student_id: '',
  password: '',
  password_confirmation: '',
  department: 'BSIT',
  hobby: '',
  grade_remarks: '',
  violations: '',
  affiliationsText: '',
  skillsText: '',
}

function splitList(text) {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function StudentFormModal({ open, mode, student, onClose, onSaved }) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    if (mode === 'edit' && student) {
      setForm({
        name: student.name ?? '',
        email: student.email ?? '',
        student_id: student.student_id ?? '',
        password: '',
        password_confirmation: '',
        department: student.department ?? 'BSIT',
        hobby: student.hobby ?? '',
        grade_remarks: student.grade_remarks ?? '',
        violations: student.violations ?? '',
        affiliationsText: Array.isArray(student.affiliations) ? student.affiliations.join(', ') : '',
        skillsText: Array.isArray(student.skills) ? student.skills.join(', ') : '',
      })
    } else {
      setForm({ ...empty, password: '', password_confirmation: '' })
    }
  }, [open, mode, student])

  if (!open) return null

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validateForm() {
    if (mode === 'create') {
      if (!form.password) {
        setError('Password is required for new students')
        return false
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
      if (form.password !== form.password_confirmation) {
        setError('Passwords do not match')
        return false
      }
    } else if (mode === 'edit' && form.password) {
      // Only validate password if it's provided in edit mode
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
      if (form.password !== form.password_confirmation) {
        setError('Passwords do not match')
        return false
      }
    }
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSaving(true)
    setError('')
    
    const payload = {
      name: form.name,
      email: form.email,
      student_id: form.student_id,
      department: form.department,
      hobby: form.hobby || null,
      grade_remarks: form.grade_remarks || null,
      violations: form.violations || null,
      affiliations: splitList(form.affiliationsText),
      skills: splitList(form.skillsText),
    }
    
    // Only include password if it's provided
    if (form.password) {
      payload.password = form.password
    }
    
    try {
      await onSaved(payload, mode, student)
      onClose()
    } catch (err) {
      const d = err.response?.data
      const msg =
        d?.message ||
        (d?.errors && Object.values(d.errors).flat().join(' ')) ||
        'Could not save student'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ccs-ink/40 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/50 bg-white/95 p-6 shadow-2xl shadow-orange-500/10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-form-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="student-form-title" className="text-xl font-bold text-ccs-ink">
              {mode === 'create' ? 'Add student' : 'Edit student'}
            </h2>
            <p className="mt-1 text-sm text-ccs-muted">
              Required fields: name, email, student ID, department{mode === 'create' ? ', password' : ''}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ccs-muted transition hover:bg-neutral-100 hover:text-ccs-ink"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-ccs-ink">Full name *</span>
              <input
                required
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </label>
            
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-ccs-ink">Email *</span>
              <input
                required
                type="email"
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </label>
            
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ccs-ink">Student ID *</span>
              <input
                required
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 font-mono text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                value={form.student_id}
                onChange={(e) => update('student_id', e.target.value)}
              />
            </label>
            
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ccs-ink">Department *</span>
              <select
                required
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
              >
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
              </select>
            </label>

            {/* Password Fields */}
            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-4 w-4 text-ccs-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium text-ccs-ink">
                  {mode === 'create' ? 'Password *' : 'Change Password (Optional)'}
                </span>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-xs text-ccs-muted">
                    {mode === 'create' ? 'Password' : 'New password'}
                  </span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder={mode === 'create' ? 'Enter password' : 'Leave blank to keep current'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block text-xs text-ccs-muted">
                    {mode === 'create' ? 'Confirm password' : 'Confirm new password'}
                  </span>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                      value={form.password_confirmation}
                      onChange={(e) => update('password_confirmation', e.target.value)}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>
              </div>
              
              {mode === 'edit' && (
                <p className="mt-2 text-xs text-ccs-muted">
                  Leave password fields empty to keep the current password unchanged.
                </p>
              )}
            </div>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-ccs-ink">Skills (comma-separated)</span>
              <input
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                placeholder="e.g. Laravel, MySQL, UI Design"
                value={form.skillsText}
                onChange={(e) => update('skillsText', e.target.value)}
              />
            </label>
            
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-ccs-ink">Affiliations (comma-separated)</span>
              <input
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                placeholder="e.g. IEEE, Peer Tutor"
                value={form.affiliationsText}
                onChange={(e) => update('affiliationsText', e.target.value)}
              />
            </label>
            
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ccs-ink">Hobby</span>
              <input
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                value={form.hobby}
                onChange={(e) => update('hobby', e.target.value)}
              />
            </label>
            
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ccs-ink">Grade remarks</span>
              <input
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                value={form.grade_remarks}
                onChange={(e) => update('grade_remarks', e.target.value)}
              />
            </label>
            
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-ccs-ink">Violations / notes</span>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none ring-ccs-orange/30 focus:ring-2"
                value={form.violations}
                onChange={(e) => update('violations', e.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-ccs-ink transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-ccs-orange px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-ccs-orange-dark disabled:opacity-60"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create student' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}