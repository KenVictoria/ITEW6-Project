import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Code2,
  Gamepad2,
  LayoutGrid,
  List,
  BookText,
  Search,
  Shapes,
  Table,
  Calendar,
  MapPin,
  Sparkles,
  Filter,
  X,
  ChevronDown,
  Trophy,
  Clock,
  Building2,
  Tag,
  FileText,
  XCircle,
} from 'lucide-react'
import { api } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'

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

// Helper function to format date for display in local time
function formatDateDisplay(value) {
  if (!value) return 'No date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDateShort(value) {
  if (!value) return 'No date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function StudentEventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')
  const [view, setView] = useState('table')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

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

  const filteredAndSortedEvents = useMemo(() => {
    const department = user?.department
    
    // Filter events based on department and search
    let filtered = events.filter((event) => 
      event.department === 'GENERAL' || event.department === department
    )
    
    // Apply search filter
    if (search) {
      const keyword = search.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(keyword) ||
          event.venue?.toLowerCase().includes(keyword) ||
          event.description?.toLowerCase().includes(keyword) ||
          event.event_type?.toLowerCase().includes(keyword)
      )
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter((event) => event.event_type === typeFilter)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.event_date) - new Date(a.event_date)
        case 'date_asc':
          return new Date(a.event_date) - new Date(b.event_date)
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '')
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '')
        default:
          return new Date(b.event_date) - new Date(a.event_date)
      }
    })
    
    return filtered
  }, [events, user?.department, search, typeFilter, sortBy])

  // Calculate stats
  const totalEvents = filteredAndSortedEvents.length
  const upcomingEvents = filteredAndSortedEvents.filter(event => new Date(event.event_date) > new Date()).length
  const eventTypes = [...new Set(filteredAndSortedEvents.map(e => e.event_type))]

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
    setSortBy('date_desc')
  }

  const hasActiveFilters = search || typeFilter

  const openEventModal = (event) => {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedEvent(null)
  }

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

  const EventDetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        <Icon size={18} className="text-ccs-orange mt-0.5" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-ccs-ink">{value || 'Not specified'}</p>
      </div>
    </div>
  )

  const renderTableView = () => (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="overflow-x-auto rounded-2xl border-2 border-gray-200 bg-white shadow-md"
    >
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-ccs-ink">Title</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-ccs-ink">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-ccs-ink">Venue</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-ccs-ink">Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedEvents.map((eventItem, idx) => {
            const isUpcoming = new Date(eventItem.event_date) > new Date()
            return (
              <motion.tr
                key={eventItem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + (idx * 0.02), duration: 0.3 }}
                className="border-b border-gray-100 transition-colors hover:bg-orange-50/40 cursor-pointer group"
                onClick={() => openEventModal(eventItem)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100 group-hover:scale-110 transition-transform">
                      <CalendarDays className="h-5 w-5 text-ccs-orange" />
                    </div>
                    <div>
                      <p className="font-semibold text-ccs-ink group-hover:text-ccs-orange transition-colors">{eventItem.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{eventItem.description || 'No description'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <EventTypePill type={eventItem.event_type} />
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
                      {formatDateShort(eventItem.event_date)}
                    </span>
                    {isUpcoming && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Upcoming
                      </span>
                    )}
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </motion.div>
  )

  const renderListView = () => (
    <div className="space-y-3">
      {filteredAndSortedEvents.map((eventItem, idx) => {
        const isUpcoming = new Date(eventItem.event_date) > new Date()
        return (
          <motion.div
            key={eventItem.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + (idx * 0.02), duration: 0.3 }}
            className="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-ccs-orange/30 cursor-pointer group"
            onClick={() => openEventModal(eventItem)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-ccs-ink group-hover:text-ccs-orange transition-colors">{eventItem.title}</h3>
                  <EventTypePill type={eventItem.event_type} />
                  {isUpcoming && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Upcoming
                    </span>
                  )}
                </div>
                <p className="text-sm text-ccs-muted line-clamp-2">{eventItem.description || 'No description'}</p>
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
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarDays size={16} className="text-ccs-orange" />
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )

  const renderCardView = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filteredAndSortedEvents.map((eventItem, idx) => {
        const IconComponent = EVENT_TYPE_ICON[eventItem.event_type] || Shapes
        const colorGradient = EVENT_TYPE_COLORS[eventItem.event_type] || EVENT_TYPE_COLORS.Other
        const isUpcoming = new Date(eventItem.event_date) > new Date()
        return (
          <motion.div
            key={eventItem.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + (idx * 0.02), duration: 0.3 }}
            className="group rounded-2xl border-2 border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden cursor-pointer"
            onClick={() => openEventModal(eventItem)}
          >
            <div className={`bg-gradient-to-r ${colorGradient} p-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent size={16} className="text-white" />
                  <span className="text-xs font-medium text-white/90">{eventItem.event_type}</span>
                </div>
                {isUpcoming && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Upcoming
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold text-ccs-ink line-clamp-2 group-hover:text-ccs-orange transition-colors">
                {eventItem.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-ccs-muted">{eventItem.description || 'No description'}</p>
              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <p className="flex items-center gap-1">
                  <MapPin size={12} />
                  {eventItem.venue}
                </p>
                <p className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDateShort(eventItem.event_date)}
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
              <h1 className="text-3xl font-bold text-ccs-ink">Events Viewer</h1>
            </div>
            <p className="text-ccs-muted">
              View all upcoming and ongoing events for your department. Click on any event to see more details.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {events.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-blue-600">
              <CalendarDays size={16} />
              <span className="text-xs font-medium">Total Events</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{totalEvents}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-green-600">
              <Sparkles size={16} />
              <span className="text-xs font-medium">Upcoming</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{upcomingEvents}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-purple-600">
              <Shapes size={16} />
              <span className="text-xs font-medium">Event Types</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{eventTypes.length}</p>
          </motion.div>
        </div>
      )}

      {/* Filters Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-4 shadow-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-ccs-orange" />
            <h3 className="font-semibold text-ccs-ink">Filters & Search</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ccs-orange hover:bg-orange-50"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-sm text-ccs-orange md:hidden"
          >
            {showFilters ? 'Hide' : 'Show'} filters
            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <div className={`flex flex-wrap gap-4 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex-1 min-w-[200px]">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-ccs-orange" size={18} />
              <input
                type="text"
                placeholder="Search by title, venue, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
            >
              <option value="">All Event Types</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-56">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
            >
              <option value="date_desc">Latest First</option>
              <option value="date_asc">Earliest First</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
            </select>
          </div>
          
          <div className="flex justify-end ml-auto">
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
      </motion.div>

      {/* Events Views */}
      {filteredAndSortedEvents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-12 text-center shadow-md"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <CalendarDays size={40} className="text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-500">No events found</p>
          <p className="mt-1 text-sm text-gray-400">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Check back later for upcoming events'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
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

      {/* Event Details Modal */}
      <AnimatePresence>
        {modalOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
              onClick={closeModal}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              {/* Modal Header with Gradient */}
              <div className={`bg-gradient-to-r ${EVENT_TYPE_COLORS[selectedEvent.event_type] || EVENT_TYPE_COLORS.Other} p-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const Icon = EVENT_TYPE_ICON[selectedEvent.event_type] || Shapes
                        return <Icon size={20} className="text-white" />
                      })()}
                      <span className="text-sm font-medium text-white/90">
                        {selectedEvent.event_type || 'Event'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="rounded-lg p-1 text-white/80 transition-all hover:bg-white/20 hover:text-white"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Description Section */}
                {selectedEvent.description && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-ccs-orange" />
                      <h3 className="text-sm font-semibold text-ccs-ink">Description</h3>
                    </div>
                    <p className="text-sm text-ccs-muted leading-relaxed pl-6">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <EventDetailRow 
                    icon={Calendar} 
                    label="Date & Time" 
                    value={formatDateDisplay(selectedEvent.event_date)}
                  />
                  <EventDetailRow 
                    icon={MapPin} 
                    label="Venue" 
                    value={selectedEvent.venue}
                  />
                  <EventDetailRow 
                    icon={Building2} 
                    label="Department" 
                    value={selectedEvent.department}
                  />
                  <EventDetailRow 
                    icon={Tag} 
                    label="Event Type" 
                    value={selectedEvent.event_type}
                  />
                </div>

                {/* Status Badge */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Event Status</span>
                    {new Date(selectedEvent.event_date) > new Date() ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        <Clock size={12} />
                        Upcoming
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        <Calendar size={12} />
                        Past Event
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={closeModal}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:border-ccs-orange/30"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}