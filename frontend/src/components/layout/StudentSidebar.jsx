import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Home, LogOut, UserCog, Menu, X, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-ccs-orange text-white shadow-md shadow-orange-500/25'
      : 'text-ccs-ink/80 hover:bg-white/80 hover:text-ccs-orange',
  ].join(' ')

export function StudentSidebar() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showDateTimeModal, setShowDateTimeModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Update time every second - but only when modal is NOT open to prevent flickering
  useEffect(() => {
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
    setCurrentDateTime(new Date())
    setShowDateTimeModal(true)
  }

  const DateTimeModal = () => {
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 rounded-xl bg-ccs-orange p-2 text-white shadow-lg md:hidden"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/40 bg-white/65 p-6 shadow-xl shadow-orange-500/5 backdrop-blur-xl transition-transform duration-300 md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with Logo and Sign Out Button */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-ccs-orange to-orange-600 shadow-lg shadow-orange-500/30">
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
                Student Portal
              </p>
              <p className="text-sm font-semibold text-ccs-ink">BSIT · BSCS</p>
            </div>
          </div>
          
          {/* Sign Out Icon Button */}
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

        {/* Divider */}
        <div className="mb-4 border-t border-ccs-muted/20" />

        {/* User Info Section */}
        <div className="mb-6">
          <p className="truncate text-sm font-semibold text-ccs-ink">{user?.name}</p>
          <p className="truncate text-xs text-ccs-muted">{user?.student_id || 'Student'}</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1">
          <NavLink to="/student" end className={navClass} onClick={closeMobileMenu}>
            <Home size={16} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/student/events" className={navClass} onClick={closeMobileMenu}>
            <CalendarDays size={16} />
            <span>Events Viewer</span>
          </NavLink>
          <NavLink to="/student/account" className={navClass} onClick={closeMobileMenu}>
            <UserCog size={16} />
            <span>Manage Account</span>
          </NavLink>
        </nav>

        {/* Bottom Card */}
        <div className="mt-6 rounded-2xl border border-white/50 bg-white/50 p-4 backdrop-blur-sm">
          <p className="truncate text-sm font-semibold text-ccs-ink">{user?.name}</p>
          <p className="truncate text-xs text-ccs-muted">{user?.student_id || 'Student'}</p>
          <p className="mt-1 text-xs text-ccs-orange">{user?.department || 'Department'}</p>
        </div>
      </aside>

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
                        You'll need to sign in again to access your account.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Signing out as</p>
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.student_id || 'Student'}</p>
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