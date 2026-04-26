import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Lock, LogOut, Save, User } from 'lucide-react'
import { api } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'

export function StudentDashboardPage() {
  const { user, logout, updateCurrentUser } = useAuth()
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [savingAccount, setSavingAccount] = useState(false)
  const [accountMessage, setAccountMessage] = useState('')
  const [accountError, setAccountError] = useState('')
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  })

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true)
    try {
      const { data } = await api.get('/events')
      setEvents(Array.isArray(data) ? data : [])
    } catch {
      setEvents([])
    } finally {
      setLoadingEvents(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    setAccountForm((prev) => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
    }))
  }, [user?.name, user?.email])

  const visibleEvents = useMemo(() => {
    const department = user?.department
    return events.filter((event) => event.department === 'GENERAL' || event.department === department)
  }, [events, user?.department])

  async function handleUpdateAccount(e) {
    e.preventDefault()
    setAccountError('')
    setAccountMessage('')
    setSavingAccount(true)

    const payload = {
      name: accountForm.name.trim(),
      email: accountForm.email.trim(),
      password: accountForm.password.trim(),
    }

    if (!payload.password) {
      delete payload.password
    }

    try {
      const { data } = await api.put('/student/account', payload)
      updateCurrentUser(data)
      setAccountForm((prev) => ({ ...prev, password: '' }))
      setAccountMessage('Account updated successfully.')
    } catch (err) {
      const d = err.response?.data
      setAccountError(d?.message || (d?.errors && Object.values(d.errors).flat().join(' ')) || 'Update failed')
    } finally {
      setSavingAccount(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-ccs-orange/10 via-white to-orange-50/30 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ccs-ink">Student Dashboard</h1>
              <p className="text-ccs-muted">
                Welcome {user?.name}. View school events and manage your account details.
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-ccs-orange px-4 py-2 text-sm font-semibold text-white hover:bg-ccs-orange-dark"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <section className="xl:col-span-3 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="text-ccs-orange" size={18} />
              <h2 className="text-lg font-semibold text-ccs-ink">Events Viewer</h2>
            </div>
            {loadingEvents ? (
              <p className="text-sm text-ccs-muted">Loading events...</p>
            ) : visibleEvents.length === 0 ? (
              <p className="text-sm text-ccs-muted">No events available for your department.</p>
            ) : (
              <div className="space-y-3">
                {visibleEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ccs-ink">{event.title}</h3>
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                        {event.event_type || 'Other'}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {event.department}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ccs-muted">{event.description || 'No description'}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Venue: {event.venue} | Date: {new Date(event.event_date).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="xl:col-span-2 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <User className="text-ccs-orange" size={18} />
              <h2 className="text-lg font-semibold text-ccs-ink">Manage Account</h2>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-4">
              {accountError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {accountError}
                </div>
              ) : null}
              {accountMessage ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {accountMessage}
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-sm font-medium text-ccs-ink">Name</label>
                <input
                  required
                  value={accountForm.name}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-ccs-orange"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-ccs-ink">Email</label>
                <input
                  type="email"
                  required
                  value={accountForm.email}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-ccs-orange"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-ccs-ink">New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Leave blank to keep current password"
                    className="w-full rounded-xl border-2 border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-ccs-orange"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingAccount}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ccs-orange px-4 py-2 text-sm font-semibold text-white hover:bg-ccs-orange-dark disabled:opacity-60"
              >
                <Save size={14} />
                {savingAccount ? 'Saving...' : 'Save Account'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
