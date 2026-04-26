import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../hooks/useApi'
import { 
  DoorOpen, Plus, Search, Edit2, Trash2, X, Filter, 
  Building2, Users, Sparkles, Loader2, ChevronDown,
  Home, MapPin, Info, CheckCircle, AlertCircle, TrendingUp  // ← Added TrendingUp here
} from 'lucide-react'

const empty = { code: '', name: '', building: '', capacity: '' }

export function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState('create')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/rooms')
      setRooms(Array.isArray(data) ? data : [])
      setFilteredRooms(Array.isArray(data) ? data : [])
    } catch {
      setRooms([])
      setFilteredRooms([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Filter rooms based on search and building
  useEffect(() => {
    let filtered = [...rooms]
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.building?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (buildingFilter) {
      filtered = filtered.filter(r => r.building === buildingFilter)
    }
    
    setFilteredRooms(filtered)
  }, [searchTerm, buildingFilter, rooms])

  function openCreate() {
    setMode('create')
    setEditing(null)
    setForm(empty)
    setError('')
    setModalOpen(true)
  }

  function openEdit(r) {
    setMode('edit')
    setEditing(r)
    setForm({
      code: r.code ?? '',
      name: r.name ?? '',
      building: r.building ?? '',
      capacity: r.capacity != null ? String(r.capacity) : '',
    })
    setError('')
    setModalOpen(true)
  }

  async function handleDelete(r) {
    setDeleteConfirm(r)
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    try {
      await api.delete(`/rooms/${deleteConfirm.id}`)
      await load()
      setDeleteConfirm(null)
    } catch {
      alert('Could not delete room (it may be assigned to a schedule).')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      building: form.building.trim() || null,
      capacity: form.capacity === '' ? null : parseInt(form.capacity, 10),
    }
    try {
      if (mode === 'create') {
        await api.post('/rooms', payload)
      } else {
        await api.put(`/rooms/${editing.id}`, payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      const d = err.response?.data
      setError(
        d?.message || (d?.errors && Object.values(d.errors).flat().join(' ')) || 'Save failed',
      )
    } finally {
      setSaving(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setBuildingFilter('')
  }

  const hasActiveFilters = searchTerm || buildingFilter

  // Get unique buildings for filter
  const uniqueBuildings = [...new Set(rooms.map(r => r.building).filter(b => b))]

  // Calculate stats
  const totalRooms = filteredRooms.length
  const totalCapacity = filteredRooms.reduce((sum, r) => sum + (r.capacity || 0), 0)
  const avgCapacity = totalRooms > 0 ? Math.round(totalCapacity / totalRooms) : 0
  const buildingsCount = uniqueBuildings.length

  if (loading && rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-ccs-orange"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <DoorOpen className="h-6 w-6 text-ccs-orange animate-pulse" />
          </div>
        </div>
        <p className="text-ccs-muted animate-pulse">Loading rooms...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ccs-orange/10 via-white to-orange-50/30 p-6">
        <div className="absolute top-0 right-0 opacity-10">
          <DoorOpen size={120} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-ccs-orange to-orange-600 p-2 shadow-lg shadow-orange-200">
                <DoorOpen className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-ccs-ink">Room Management</h1>
            </div>
            <p className="text-ccs-muted">
              Create, update, and remove classroom and lab spaces for the CCS department.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-ccs-orange to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Plus size={18} className="transition-transform group-hover:scale-110" />
            Add Room
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {rooms.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-md">
            <div className="flex items-center gap-2 text-blue-600">
              <DoorOpen size={16} />
              <span className="text-xs font-medium">Total Rooms</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{totalRooms}</p>
          </div>
          <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-md">
            <div className="flex items-center gap-2 text-green-600">
              <Users size={16} />
              <span className="text-xs font-medium">Total Capacity</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{totalCapacity}</p>
          </div>
          <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-3 shadow-md">
            <div className="flex items-center gap-2 text-orange-600">
              <TrendingUp size={16} />
              <span className="text-xs font-medium">Avg Capacity</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{avgCapacity}</p>
          </div>
          <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-3 shadow-md">
            <div className="flex items-center gap-2 text-purple-600">
              <Building2 size={16} />
              <span className="text-xs font-medium">Buildings</span>
            </div>
            <p className="mt-1 text-xl font-bold text-ccs-ink">{buildingsCount}</p>
          </div>
        </div>
      )}

      {/* Filters Card */}
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-ccs-orange" />
            <h3 className="font-semibold text-ccs-ink">Filters</h3>
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
                placeholder="Search by code, name, or building..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 transition-all focus:border-ccs-orange focus:outline-none focus:shadow-md"
            >
              <option value="">All Buildings</option>
              {uniqueBuildings.map((building) => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/80 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Room</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Code</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Building</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Capacity</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Status</th>
                <th className="p-4 text-left text-sm font-semibold text-ccs-ink">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((r, idx) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-gray-100 transition-colors hover:bg-orange-50/40 group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100">
                        <DoorOpen className="h-5 w-5 text-ccs-orange" />
                      </div>
                      <div>
                        <p className="font-semibold text-ccs-ink">{r.name}</p>
                        <p className="text-xs text-gray-400">ID: {r.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                      {r.code}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="text-gray-600">{r.building || '—'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span className="font-semibold text-ccs-ink">{r.capacity || '—'}</span>
                      {r.capacity && (
                        <span className="text-xs text-gray-400">seats</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {r.capacity ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                        <AlertCircle size={12} />
                        No Capacity
                      </span>
                    )}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="rounded-lg p-1.5 text-blue-600 transition-all hover:bg-blue-50 hover:scale-110"
                        title="Edit Room"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        className="rounded-lg p-1.5 text-red-600 transition-all hover:bg-red-50 hover:scale-110"
                        title="Delete Room"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRooms.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <DoorOpen size={40} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">No rooms found</p>
            <p className="mt-1 text-sm text-gray-400">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Click "Add Room" to get started'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-ccs-orange hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Room Form Modal */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-ccs-orange/10 to-orange-50 p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-ccs-ink">
                      {mode === 'create' ? 'Add Room' : 'Edit Room'}
                    </h2>
                    <p className="text-sm text-ccs-muted mt-1">
                      {mode === 'create' ? 'Add a new room to the system' : 'Update room information'}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>{error}</div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Room Code *
                  </label>
                  <input
                    required
                    placeholder="e.g., IT-101"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 font-mono text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Room Name *
                  </label>
                  <input
                    required
                    placeholder="e.g., Information Technology Laboratory 1"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Building
                  </label>
                  <input
                    placeholder="e.g., Main Building, Annex Building"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.building}
                    onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-ccs-ink mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g., 40"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-ccs-orange focus:shadow-md"
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
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
                      mode === 'create' ? 'Add Room' : 'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="bg-red-50 p-5 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Delete Room</h3>
                    <p className="text-sm text-red-600">Confirm room removal</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This action will permanently delete the room from the system. This cannot be undone.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ccs-orange/20 to-orange-100">
                      <DoorOpen className="h-6 w-6 text-ccs-orange" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Room to remove:</p>
                      <p className="text-base font-semibold text-ccs-ink">{deleteConfirm.name}</p>
                      <p className="text-xs text-gray-500">Code: {deleteConfirm.code} • Building: {deleteConfirm.building || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 p-5 border-t bg-gray-50">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Room
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}