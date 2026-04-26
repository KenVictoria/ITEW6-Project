import { useState, useEffect, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { LogOut, AlertTriangle, X, Clock } from 'lucide-react'

const navClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-ccs-orange text-white shadow-md shadow-orange-500/25'
      : 'text-ccs-ink/80 hover:bg-white/80 hover:text-ccs-orange',
  ].join(' ')

export function Sidebar() {
  const { user, logout, hasRole } = useAuth()
  const [open, setOpen] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showDateTimeModal, setShowDateTimeModal] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  const academicDean = hasRole('admin', 'dean')
  const secretaryNav = hasRole('secretary')
  const roomsAccess = hasRole('admin', 'dean', 'secretary')

  // Update time every second - but only when modal is NOT open to prevent flickering
  useEffect(() => {
    // Don't update time if modal is open to prevent re-renders
    if (showDateTimeModal) return
    
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [showDateTimeModal])

  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const formatShortDate = (date) => {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const openDateTimeModal = () => {
    // Update time once before opening modal
    setCurrentDateTime(new Date())
    setShowDateTimeModal(true)
  }

  const DateTimeModal = () => {
    // Use local state for time inside modal to prevent re-renders of parent
    const [modalTime, setModalTime] = useState(new Date())
    
    useEffect(() => {
      const timer = setInterval(() => {
        setModalTime(new Date())
      }, 1000)
      
      return () => clearInterval(timer)
    }, [])
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60"
          onClick={() => setShowDateTimeModal(false)}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-ccs-orange to-orange-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={24} className="text-white" />
                <h2 className="text-xl font-bold text-white">Current Date & Time</h2>
              </div>
              <button
                onClick={() => setShowDateTimeModal(false)}
                className="rounded-lg p-1 text-white/80 transition-all hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="text-center space-y-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-white border-2 border-orange-100">
                <p className="text-sm font-medium text-ccs-muted mb-2">Today's Date</p>
                <p className="text-xl font-bold text-ccs-ink">{formatDate(modalTime)}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100">
                <p className="text-sm font-medium text-ccs-muted mb-2">Current Time</p>
                <div className="flex items-center justify-center gap-2">
                  <Clock size={20} className="text-ccs-orange" />
                  <p className="text-2xl font-bold text-ccs-ink font-mono">{formatTime(modalTime)}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100">
                <p className="text-sm font-medium text-ccs-muted mb-2">Timezone</p>
                <p className="text-sm text-ccs-ink">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setShowDateTimeModal(false)}
              className="w-full rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-ccs-orange shadow-lg backdrop-blur-md transition hover:bg-ccs-orange-soft md:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-white/40 bg-white/65 p-6 shadow-xl shadow-orange-500/5 backdrop-blur-xl transition-transform duration-300 ease-out md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Header with Logout Icon at the very top */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-ccs-orange to-ccs-orange-dark shadow-lg shadow-orange-500/30">
              <img
                src="/logo.jpg"
                alt="CCS Logo"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.classList.add('flex', 'items-center', 'justify-center')
                  e.target.parentElement.innerHTML = '<span class="text-white text-lg font-bold">CCS</span>'
                }}
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ccs-orange">
                Profiling
              </p>
              <p className="text-sm font-semibold text-ccs-ink">BSIT · BSCS</p>
            </div>
          </div>
          
          {/* Sign Out Icon Button at the very top */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="rounded-xl bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100 hover:scale-105 hover:shadow-md group"
            title="Sign out"
          >
            <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* Date and Time Display in Sidebar */}
        <div className="mb-6 w-full rounded-xl bg-gradient-to-r from-ccs-orange/10 to-orange-50 p-3 border border-orange-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-ccs-orange/20 p-1.5">
                <Clock size={14} className="text-ccs-orange" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-ccs-ink">Current Time</p>
                <p className="text-xs text-ccs-muted font-mono">{formatTime(currentDateTime)}</p>
              </div>
            </div>
            <button
              onClick={openDateTimeModal}
              className="text-xs text-ccs-orange hover:underline font-medium"
            >
              View Details →
            </button>
          </div>
        </div>

        {/* The Vertical Center Divider */}
        <div className="mb-4 border-t border-ccs-muted/20" />

        {/* Bottom Section - User Info */}
        <div className="mb-6">
          <p className="truncate text-sm font-semibold text-ccs-ink">{user?.name}</p>
          <p className="truncate text-xs capitalize text-ccs-muted">{user?.role}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}>
            <span className="h-2 w-2 rounded-full bg-current opacity-60" />
            Dashboard
          </NavLink>

          {hasRole('admin') && (
            <>
              <p className="mb-1 mt-6 px-4 text-[11px] font-bold uppercase tracking-widest text-ccs-muted">
                System Admin
              </p>
              <NavLink to="/users" className={navClass} onClick={() => setOpen(false)}>
                <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                User management
              </NavLink>
            </>
          )}

          {secretaryNav && (
            <>
              <p className="mb-1 mt-6 px-4 text-[11px] font-bold uppercase tracking-widest text-ccs-muted">
                Secretariat
              </p>
              <NavLink to="/students" className={navClass} onClick={() => setOpen(false)}>
                <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                Student management
              </NavLink>
              <NavLink to="/academics/sections" className={navClass} onClick={() => setOpen(false)}>
                <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                Section management
              </NavLink>
            </>
          )}

          {(academicDean || roomsAccess) && (
            <>
              <p className="mb-1 mt-6 px-4 text-[11px] font-bold uppercase tracking-widest text-ccs-muted">
                Academic
              </p>
              {academicDean && (
                <NavLink to="/academics/students" className={navClass} onClick={() => setOpen(false)}>
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                  Student directory & PDF
                </NavLink>
              )}
              {academicDean && (
                <NavLink to="/academics/schedules" className={navClass} onClick={() => setOpen(false)}>
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                  Schedule management
                </NavLink>
              )}
              {academicDean && (
                <NavLink to="/academics/sections" className={navClass} onClick={() => setOpen(false)}>
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                  Section management
                </NavLink>
              )}
              {academicDean && (
                <NavLink to="/academics/faculty" className={navClass} onClick={() => setOpen(false)}>
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                  Faculty management
                </NavLink>
              )}
              {academicDean && (
                <NavLink to="/academics/courses" className={navClass} onClick={() => setOpen(false)}>
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                  Course management
                </NavLink>
              )}
              {hasRole('admin', 'dean', 'secretary') && (
                <NavLink to="/academics/curriculum" className={navClass} onClick={() => setOpen(false)}>
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                  Curriculum page
                </NavLink>
              )}
              {hasRole('admin', 'dean', 'secretary') && (
                <NavLink to="/academics/events" className={navClass} onClick={() => setOpen(false)}>
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                  Event management
                </NavLink>
              )}
              {roomsAccess && (
                <NavLink to="/academics/rooms" className={navClass} onClick={() => setOpen(false)}>
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                  Room management
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Removed the old logout button from bottom section since we added it at the top */}
        <div className="mt-6 rounded-2xl border border-white/50 bg-white/50 p-4 backdrop-blur-sm">
          <p className="truncate text-sm font-semibold text-ccs-ink">{user?.name}</p>
          <p className="truncate text-xs capitalize text-ccs-muted">{user?.role}</p>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-ccs-ink/20 backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => !isLoggingOut && setShowLogoutModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="bg-orange-50 p-4 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <LogOut className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Sign Out</h3>
                    <p className="text-sm text-gray-500">Confirm you want to leave</p>
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    disabled={isLoggingOut}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        You will be signed out of your account
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Any unsaved changes will be lost. You'll need to sign in again to access your account.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Signing out as</p>
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border-t bg-gray-50">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 rounded-lg bg-ccs-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ccs-orange-dark disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut size={16} />
                      Yes, Sign Out
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Date & Time Modal */}
      <AnimatePresence>
        {showDateTimeModal && <DateTimeModal />}
      </AnimatePresence>
    </>
  )
}