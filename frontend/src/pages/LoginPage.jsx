import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, Calendar, Users, BookOpen, GraduationCap, Shield, FileText, Clock, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated, loading, user } = useAuth()
  const [email, setEmail] = useState('admin@ccs.edu')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to={user?.role === 'student' ? '/student' : '/'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
    } catch (err) {
      const d = err.response?.data
      const msg =
        d?.errors?.email?.[0] || d?.message || (typeof d === 'string' ? d : null) || 'Login failed'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const features = [
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Student Management',
      description: 'Comprehensive student profiles with skills, affiliations, and academic records'
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: 'Schedule Management',
      description: 'Smart scheduling with automatic conflict detection and calendar views'
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: 'Course & Faculty Management',
      description: 'Manage courses, faculty assignments, and room allocations'
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Advanced Reporting',
      description: 'Generate PDF reports with advanced filtering options'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Role-Based Access',
      description: 'Secure access control for Admin, Dean, and Secretary roles'
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Real-time Conflict Detection',
      description: 'Prevent scheduling conflicts with instant validation'
    }
  ]

  return (
    <div className="flex min-h-screen overflow-hidden bg-white">
      {/* Left Side - Login Form */}
      <div className="relative flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-ccs-orange/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-ccs-orange/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-md">
          {/* Circular Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-ccs-orange to-ccs-orange-dark shadow-lg shadow-orange-500/30 ring-4 ring-white/50">
              <img
                src="/logo.jpg"
                alt="CCS Logo"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.classList.add('flex', 'items-center', 'justify-center')
                  e.target.parentElement.innerHTML = '<span class="text-white text-xl font-bold">CCS</span>'
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-ccs-ink">Welcome Back</h1>
            <p className="mt-1 text-sm text-ccs-muted">Sign in to access the Student Profiling System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ccs-muted">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white/90 px-4 py-3 text-ccs-ink outline-none ring-ccs-orange/30 transition focus:ring-2 focus:border-ccs-orange"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ccs-muted">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white/90 px-4 py-3 pr-12 text-ccs-ink outline-none ring-ccs-orange/30 transition focus:ring-2 focus:border-ccs-orange"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ccs-orange transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-ccs-orange py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-ccs-orange-dark disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ccs-muted">
            Demo accounts:{' '}
            <span className="font-medium text-ccs-orange">admin@ccs.edu</span> /{' '}
            <span className="font-medium text-ccs-orange">dean@ccs.edu</span> /{' '}
            <span className="font-medium text-ccs-orange">secretary@ccs.edu</span> /{' '}
            <span className="font-medium text-ccs-orange">student email</span>
            <br />
            Password for all: <code className="rounded bg-orange-50 px-1 text-ccs-orange font-medium">password</code>
          </p>
        </div>
      </div>

      {/* Right Side - System Description */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:bg-gradient-to-br from-ccs-orange/5 via-white to-ccs-orange/10 lg:px-12">
        <div className="mx-auto max-w-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ccs-orange to-ccs-orange-dark shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-ccs-ink">CCS Student Profiling System</h2>
            <p className="mt-2 text-ccs-muted">Comprehensive management solution for BSIT and BSCS departments</p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 hover:shadow-lg hover:shadow-orange-500/10"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-ccs-orange/10 text-ccs-orange transition-colors group-hover:bg-ccs-orange group-hover:text-white">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ccs-ink">{feature.title}</h3>
                    <p className="mt-1 text-xs text-ccs-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-8 rounded-2xl border border-white/60 bg-white/50 p-6 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-ccs-orange">2</div>
                <div className="text-xs text-ccs-muted">Departments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-ccs-orange">1000+</div>
                <div className="text-xs text-ccs-muted">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-ccs-orange">3</div>
                <div className="text-xs text-ccs-muted">User Roles</div>
              </div>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="mt-6 text-center">
            <p className="text-xs text-ccs-muted">
              <CheckCircle className="mr-1 inline h-3 w-3" />
              Secure • Efficient • User-Friendly
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}