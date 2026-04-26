import { CalendarDays, UserCog, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function StudentHomePage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-ccs-orange/10 via-white to-orange-50/30 p-6">
        <h1 className="text-3xl font-bold text-ccs-ink">Student Dashboard</h1>
        <p className="text-ccs-muted">
          Welcome, {user?.name}. Access your events and manage your profile information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <GraduationCap size={18} />
            <span className="text-sm font-semibold">Student ID</span>
          </div>
          <p className="mt-2 text-lg font-bold text-ccs-ink">{user?.student_id || '—'}</p>
        </div>
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
          <div className="flex items-center gap-2 text-purple-700">
            <GraduationCap size={18} />
            <span className="text-sm font-semibold">Department</span>
          </div>
          <p className="mt-2 text-lg font-bold text-ccs-ink">{user?.department || '—'}</p>
        </div>
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-700">
            <GraduationCap size={18} />
            <span className="text-sm font-semibold">Role</span>
          </div>
          <p className="mt-2 text-lg font-bold capitalize text-ccs-ink">{user?.role || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/student/events"
          className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm transition hover:border-ccs-orange/50 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-2 text-ccs-orange">
              <CalendarDays size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-ccs-ink">Events Viewer</h2>
              <p className="text-sm text-ccs-muted">See all general and department events.</p>
            </div>
          </div>
        </Link>

        <Link
          to="/student/account"
          className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm transition hover:border-ccs-orange/50 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-2 text-ccs-orange">
              <UserCog size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-ccs-ink">Manage Account</h2>
              <p className="text-sm text-ccs-muted">Update your student profile and password.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
