import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  Code2,
  Edit2,
  Gamepad2,
  LayoutGrid,
  List,
  BookText,
  Plus,
  Search,
  Shapes,
  Table,
  Trash2,
  Trophy,
  X,
  Loader2,
  Calendar,
  MapPin,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { api } from '../hooks/useApi'

const EVENT_TYPES = ['Gaming', 'Programming', 'Sports', 'Literature', 'Other']

const EVENT_TYPE_ICON = {
  Gaming: Gamepad2,
  Programming: Code2,
  Sports: Trophy,
  Literature: BookText,
  Other: Shapes,
}

const EVENT_TYPE_COLORS = {
  Gaming: 'from-purple-500 to-pink-500',
  Programming: 'from-blue-500 to-cyan-500',
  Sports: 'from-green-500 to-emerald-500',
  Literature: 'from-amber-500 to-orange-500',
  Other: 'from-gray-500 to-gray-600',
}

const EMPTY_FORM = {
  title: '',
  description: '',
  venue: '',
  department: 'GENERAL',
  event_type: 'Other',
  event_date: '',
}

// Helper function to format date for display in local time
function formatDateDisplay(value) {
  if (!value) return 'No date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// Convert local datetime-local input value to UTC ISO string for storage
function toUTCISOString(localDateTime) {
  if (!localDateTime) return ''
  // Create a date object from the local datetime string
  const date = new Date(localDateTime)
  if (Number.isNaN(date.getTime())) return ''
  // Return ISO string which is UTC
  return date.toISOString()
}

// Convert UTC ISO string to local datetime-local input value
function toDateTimeLocal(utcISOString) {
  if (!utcISOString) return ''
  const date = new Date(utcISOString)
  if (Number.isNaN(date.getTime())) return ''
  
  // Get local time components
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [view, setView] = useState('table')
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState('create')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [conflictError, setConflictError] = useState('')

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/events')
      setEvents(Array.isArray(data) ? data : [])
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const filteredEvents = useMemo(() => {
    let list = [...events]
    if (search) {
      const keyword = search.toLowerCase()
      list = list.filter(
        (event) =>
          event.title?.toLowerCase().includes(keyword) ||
          event.venue?.toLowerCase().includes(keyword) ||
          event.description?.toLowerCase().includes(keyword),
      )
    }

    if (departmentFilter) {
      list = list.filter((event) => event.department === departmentFilter)
    }

    if (typeFilter) {
      list = list.filter((event) => event.event_type === typeFilter)
    }

    // Sort by date (most recent first)
    list.sort((a, b) => new Date(b.event_date) - new Date(a.event_date))

    return list
  }, [events, search, departmentFilter, typeFilter])

  // Calculate stats
  const totalEvents = filteredEvents.length
  const upcomingEvents = filteredEvents.filter(event => new Date(event.event_date) > new Date()).length
  const departments = [...new Set(filteredEvents.map(e => e.department))]
  const eventTypes = [...new Set(filteredEvents.map(e => e.event_type))]

  // Conflict detection function
  const checkForConflicts = (eventDate, excludeEventId = null) => {
    const newEventTime = new Date(eventDate).getTime()
    
    return events.some(event => {
      // Skip the current event when editing
      if (excludeEventId && event.id === excludeEventId) return false
      
      const existingEventTime = new Date(event.event_date).getTime()
      // Check if events are within 1 hour of each other (you can adjust this threshold)
      const timeDifference = Math.abs(newEventTime - existingEventTime)
      const oneHourInMs = 60 * 60 * 1000
      
      return timeDifference < oneHourInMs
    })
  }

  // Get conflicting events
  const getConflictingEvents = (eventDate, excludeEventId = null) => {
    const newEventTime = new Date(eventDate).getTime()
    
    return events.filter(event => {
      if (excludeEventId && event.id === excludeEventId) return false
      const existingEventTime = new Date(event.event_date).getTime()
      const timeDifference = Math.abs(newEventTime - existingEventTime)
      const oneHourInMs = 60 * 60 * 1000
      return timeDifference < oneHourInMs
    })
  }

  function openCreate() {
    setMode('create')
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setConflictError('')
    setModalOpen(true)
  }

  function openEdit(event) {
    setMode('edit')
    setEditing(event)
    setForm({
      title: event.title ?? '',
      description: event.description ?? '',
      venue: event.venue ?? '',
      department: event.department ?? 'GENERAL',
      event_type: event.event_type ?? 'Other',
      event_date: toDateTimeLocal(event.event_date),
    })
    setError('')
    setConflictError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setConflictError('')

    // Convert local datetime to UTC for storage
    const utcEventDate = toUTCISOString(form.event_date)
    
    if (!utcEventDate) {
      setError('Please select a valid event date and time')
      setSaving(false)
      return
    }

    // Check for conflicts
    const hasConflict = checkForConflicts(utcEventDate, editing?.id)
    
    if (hasConflict) {
      const conflictingEvents = getConflictingEvents(utcEventDate, editing?.id)
      setConflictError(
        `This time slot conflicts with existing event(s):\n${conflictingEvents.map(e => `• ${e.title} at ${formatDateDisplay(e.event_date)}`).join('\n')}\n\nPlease choose a different time.`
      )
      setSaving(false)
      return
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      venue: form.venue.trim(),
      department: form.department,
      event_type: form.event_type,
      event_date: utcEventDate, // Store in UTC
    }

    try {
      if (mode === 'create') {
        await api.post('/events', payload)
      } else {
        await api.put(`/events/${editing.id}`, payload)
      }
      setModalOpen(false)
      await loadEvents()
    } catch (err) {
      const d = err.response?.data
      setError(d?.message || (d?.errors && Object.values(d.errors).flat().join(' ')) || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(eventItem) {
    if (!window.confirm(`Delete event "${eventItem.title}"? This action cannot be undone.`)) return
    try {
      await api.delete(`/events/${eventItem.id}`)
      await loadEvents()
    } catch {
      alert('Failed to delete event.')
    }
  }

  // Handle date change with real-time conflict check
  const handleDateChange = (value) => {
    setForm((f) => ({ ...f, event_date: value }))
    setConflictError('')
    
    // Optional: Real-time conflict check (can be uncommented)
    // if (value) {
    //   const utcDate = toUTCISOString(value)
    //   const hasConflict = checkForConflicts(utcDate, editing?.id)
    //   if (hasConflict) {
    //     setConflictError('This time slot conflicts with an existing event')
    //   }
    // }
  }

  const sharedActions = (eventItem) => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => openEdit(eventItem)}
        className="rounded-lg p-2 text-blue-600 transition-all hover:bg-blue-50 hover:scale-110"
        title="Edit event"
      >
        <Edit2 size={15} />
      </button>
      <button
        type="button"
        onClick={() => handleDelete(eventItem)}
        className="rounded-lg p-2 text-red-600 transition-all hover:bg-red-50 hover:scale-110"
        title="Delete event"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )

  const EventTypePill = ({ type }) => {
    const safeType = type || 'Other'
    const Icon = EVENT_TYPE_ICON[safeType] || Shapes
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
        <Icon size={12} />
        {safeType}
      </span>
    )
  }

  const renderTableView = () => (
    <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 bg-white shadow-md">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-ccs-ink">Title</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-ccs-ink">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-ccs-ink">Department</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-ccs-ink">Venue</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-ccs-ink">Date & Time</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-ccs-ink">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((eventItem, idx) => {
            const isUpcoming = new Date(eventItem.event_date) > new Date()
            return (
              <motion.tr
                key={eventItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="border-b border-gray-100 transition-colors hover:bg-orange-50/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100">
                      <CalendarDays className="h-5 w-5 text-ccs-orange" />
                    </div>
                    <div>
                      <p className="font-semibold text-ccs-ink">{eventItem.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{eventItem.description || 'No description'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <EventTypePill type={eventItem.event_type} />
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    eventItem.department === 'BSIT' 
                      ? 'bg-orange-100 text-orange-700' 
                      : eventItem.department === 'BSCS'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {eventItem.department}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-ccs-ink">
                    <MapPin size={12} className="text-gray-400" />
                    {eventItem.venue}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar size={12} className="text-gray-400" />
                    <span className={isUpcoming ? 'text-green-600 font-medium' : 'text-ccs-ink'}>
                      {formatDateDisplay(eventItem.event_date)}
                    </span>
                    {isUpcoming && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Upcoming
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">{sharedActions(eventItem)}</td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  const renderListView = () => (
    <div className="space-y-3">
      {filteredEvents.map((eventItem, idx) => {
        const isUpcoming = new Date(eventItem.event_date) > new Date()
        return (
          <motion.div
            key={eventItem.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-ccs-orange/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-ccs-ink">{eventItem.title}</h3>
                  <EventTypePill type={eventItem.event_type} />
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    eventItem.department === 'BSIT' 
                      ? 'bg-orange-100 text-orange-700' 
                      : eventItem.department === 'BSCS'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {eventItem.department}
                  </span>
                  {isUpcoming && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Upcoming
                    </span>
                  )}
                </div>
                <p className="text-sm text-ccs-muted">{eventItem.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {eventItem.venue}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDateDisplay(eventItem.event_date)}
                  </span>
                </div>
              </div>
              {sharedActions(eventItem)}
            </div>
          </motion.div>
        )
      })}
    </div>
  )

  const renderCardView = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filteredEvents.map((eventItem, idx) => {
        const IconComponent = EVENT_TYPE_ICON[eventItem.event_type] || Shapes
        const colorGradient = EVENT_TYPE_COLORS[eventItem.event_type] || EVENT_TYPE_COLORS.Other
        const isUpcoming = new Date(eventItem.event_date) > new Date()
        return (
          <motion.div
            key={eventItem.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="group rounded-2xl border-2 border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${colorGradient} p-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent size={16} className="text-white" />
                  <span className="text-xs font-medium text-white/90">{eventItem.event_type}</span>
                </div>
                {sharedActions(eventItem)}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-ccs-ink line-clamp-2 flex-1">{eventItem.title}</h3>
                {isUpcoming && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 whitespace-nowrap">
                    Upcoming
                  </span>
                )}
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-ccs-muted">{eventItem.description || 'No description'}</p>
              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <p className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100">
                    {eventItem.department}
                  </span>
                </p>
                <p className="flex items-center gap-1">
                  <MapPin size={12} />
                  {eventItem.venue}
                </p>
                <p className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDateDisplay(eventItem.event_date)}
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )

  // Loading animation
  if (loading && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-ccs-orange"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CalendarDays className="h-6 w-6 text-ccs-orange animate-pulse" />
          </div>
        </div>
        <p className="text-ccs-muted animate-pulse">Loading events...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ccs-orange/10 via-white to-orange-50/30 p-6">
        <div className="absolute top-0 right-0 opacity-10">
          <CalendarDays size={120} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-ccs-orange to-orange-600 p-2 shadow-lg shadow-orange-200">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-ccs-ink">Event Management</h1>
            </div>
            <p className="text-ccs-muted">
              Create, update, and manage events with conflict detection and timezone support.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Plus size={18} className="transition-transform group-hover:scale-110" />
            Add Event
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {events.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-blue-600">
              <CalendarDays size={16} />
              <span className="text-xs font-medium">Total Events</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{totalEvents}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-green-600">
              <Sparkles size={16} />
              <span className="text-xs font-medium">Upcoming</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{upcomingEvents}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-purple-600">
              <Shapes size={16} />
              <span className="text-xs font-medium">Event Types</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{eventTypes.length}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-orange-600">
              <Calendar size={16} />
              <span className="text-xs font-medium">Departments</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{departments.length}</p>
          </motion.div>
        </div>
      )}

      {/* Filters Card */}
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-4 shadow-md">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ccs-orange" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, venue, description..."
                className="w-full rounded-xl border-2 border-gray-200 py-2 pl-10 pr-3 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
              />
            </div>
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
          >
            <option value="">All Departments</option>
            <option value="GENERAL">GENERAL</option>
            <option value="BSIT">BSIT</option>
            <option value="BSCS">BSCS</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border-2 border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
          >
            <option value="">All Event Types</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="flex justify-end">
            <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setView('table')}
                className={`rounded-lg p-2 transition-all ${view === 'table' ? 'bg-white text-ccs-orange shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                title="Table view"
              >
                <Table size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`rounded-lg p-2 transition-all ${view === 'list' ? 'bg-white text-ccs-orange shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                title="List view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setView('card')}
                className={`rounded-lg p-2 transition-all ${view === 'card' ? 'bg-white text-ccs-orange shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                title="Card view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {(search || departmentFilter || typeFilter) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setSearch('')
                setDepartmentFilter('')
                setTypeFilter('')
              }}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ccs-orange hover:bg-orange-50"
            >
              <X size={12} />
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Events Views */}
      {filteredEvents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-12 text-center shadow-md"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <CalendarDays size={40} className="text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-500">No events found</p>
          <p className="mt-1 text-sm text-gray-400">
            {(search || departmentFilter || typeFilter) ? 'Try adjusting your filters' : 'Click "Add Event" to get started'}
          </p>
          {(search || departmentFilter || typeFilter) && (
            <button
              onClick={() => {
                setSearch('')
                setDepartmentFilter('')
                setTypeFilter('')
              }}
              className="mt-4 text-sm text-ccs-orange hover:underline"
            >
              Clear all filters
            </button>
          )}
        </motion.div>
      ) : view === 'table' ? (
        renderTableView()
      ) : view === 'list' ? (
        renderListView()
      ) : (
        renderCardView()
      )}

      {/* Event Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-ccs-orange/10 to-orange-50 p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-ccs-ink">
                      {mode === 'create' ? 'Create Event' : 'Edit Event'}
                    </h2>
                    <p className="text-sm text-ccs-muted mt-1">
                      {mode === 'create' ? 'Add a new event to the calendar' : 'Update event information'}
                    </p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form className="p-5 space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>{error}</div>
                  </div>
                )}

                {conflictError && (
                  <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <div className="whitespace-pre-line">{conflictError}</div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-semibold text-ccs-ink">Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ccs-ink">Department *</label>
                    <select
                      required
                      value={form.department}
                      onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                      className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    >
                      <option value="GENERAL">GENERAL</option>
                      <option value="BSIT">BSIT</option>
                      <option value="BSCS">BSCS</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ccs-ink">Event Type *</label>
                    <select
                      required
                      value={form.event_type}
                      onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}
                      className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ccs-ink">Event Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.event_date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">Select date and time in your local timezone</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ccs-ink">Venue *</label>
                    <input
                      required
                      value={form.venue}
                      onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                      className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                      placeholder="Enter venue"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-ccs-ink">Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    placeholder="Enter event description (optional)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      mode === 'create' ? 'Create Event' : 'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}