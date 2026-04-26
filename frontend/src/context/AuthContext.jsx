import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../hooks/useApi'

const AuthContext = createContext(null)

const STORAGE_KEY = 'ccs_auth_token'
const USER_KEY = 'ccs_auth_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(!!localStorage.getItem(STORAGE_KEY))
  const navigate = useNavigate()

  useEffect(() => {
    setAuthToken(token)
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/user')
        if (!cancelled) {
          setUser(data)
          localStorage.setItem(USER_KEY, JSON.stringify(data))
        }
      } catch {
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const getDefaultPathForRole = useCallback((role) => {
    return role === 'student' ? '/student' : '/'
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    navigate(getDefaultPathForRole(data.user?.role), { replace: true })
  }, [navigate, getDefaultPathForRole])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch {
      /* ignore */
    }
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const updateCurrentUser = useCallback((nextUser) => {
    setUser(nextUser)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  const hasRole = useCallback(
    (...roles) => {
      if (!user?.role) return false
      return roles.includes(user.role)
    },
    [user],
  )

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      updateCurrentUser,
      hasRole,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user, loading, login, logout, updateCurrentUser, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
