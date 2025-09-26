'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import Button from '../../components/Button'
import Card from '../../components/Card'

export default function TripLogger() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('logs') // 'logs' or 'analytics'
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'trip', 'fuel'
  const [activePeriod, setActivePeriod] = useState('today') // 'today', 'week', 'month'
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [entryType, setEntryType] = useState('trip') // 'trip' | 'fuel' | 'reading'
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [kmReading, setKmReading] = useState('')
  const [amountReceived, setAmountReceived] = useState('')
  const [fuelOdo, setFuelOdo] = useState('')
  const [fuelLiters, setFuelLiters] = useState('')
  const [fuelCost, setFuelCost] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [readingList, setReadingList] = useState([])
  const [readingEditingId, setReadingEditingId] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 5
  const [editingId, setEditingId] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    loadTrips()
    refreshReadingList()
  }, [])

  useEffect(() => {
    const total = trips.filter(t => t.type === 'trip' || t.type === 'fuel').length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    if (currentPage > totalPages - 1) {
      setCurrentPage(totalPages - 1)
    }
  }, [trips, currentPage])

  function getStoredReadings() {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('trip-logger:readings') : null
      return raw ? JSON.parse(raw) : []
    } catch (_) {
      return []
    }
  }

  function addStoredReading(reading) {
    try {
      const current = getStoredReadings()
      // ensure id
      const withId = { id: reading.id || String(Date.now()), ...reading }
      const next = [...current, withId]
      next.sort((a, b) => String(a.date).localeCompare(String(b.date)))
      if (typeof window !== 'undefined') {
        localStorage.setItem('trip-logger:readings', JSON.stringify(next))
      }
      setReadingList(next)
    } catch (_) {}
  }

  function refreshReadingList() {
    const list = getStoredReadings().map(r => (r.id ? r : { id: String(Date.now()) + '-' + String(r.km_reading||'0'), ...r }))
    // persist ids if missing
    try { localStorage.setItem('trip-logger:readings', JSON.stringify(list)) } catch (_) {}
    setReadingList(list)
  }

  function updateStoredReading(id, updates) {
    const list = getStoredReadings()
    const next = list.map(r => r.id === id ? { ...r, ...updates } : r).sort((a,b)=> String(a.date).localeCompare(String(b.date)))
    try { localStorage.setItem('trip-logger:readings', JSON.stringify(next)) } catch (_) {}
    setReadingList(next)
  }

  function deleteStoredReading(id) {
    const list = getStoredReadings()
    const next = list.filter(r => r.id !== id)
    try { localStorage.setItem('trip-logger:readings', JSON.stringify(next)) } catch (_) {}
    setReadingList(next)
  }

  async function loadTrips() {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrips(data || [])
    } catch (error) {
      console.error('Error loading trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrips = trips.filter(trip => {
    // Hide pure odometer readings from list
    if (trip.type === 'reading') return false
    if (activeFilter === 'all') return true
    if (activeFilter === 'trip') return trip.type === 'trip'
    if (activeFilter === 'fuel') return trip.type === 'fuel'
    return true
  })

  const getAnalytics = (period) => {
    const now = new Date()
    let filtered = trips

    if (period === 'today') {
      filtered = trips.filter(t => isSameDay(t.date, now))
    } else if (period === 'week') {
      filtered = trips.filter(t => isSameWeek(t.date, now))
    } else if (period === 'month') {
      filtered = trips.filter(t => isSameMonth(t.date, now))
    }

    const totalDistance = filtered
      .filter(t => t.type === 'trip')
      .reduce((sum, t) => sum + (t.distance || 0), 0)

    const totalReceived = filtered
      .filter(t => t.type === 'trip')
      .reduce((sum, t) => sum + (t.amount_received || 0), 0)

    const totalFuel = filtered
      .filter(t => t.type === 'fuel')
      .reduce((sum, t) => sum + (t.fuel_liters || 0), 0)

    const totalFuelCost = filtered
      .filter(t => t.type === 'fuel')
      .reduce((sum, t) => sum + (t.fuel_cost || 0), 0)

    return { totalDistance, totalReceived, totalFuel, totalFuelCost }
  }

  function isSameDay(date1, date2) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate()
  }

  function isSameWeek(date1, date2) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const startOfWeek = new Date(d2)
    startOfWeek.setDate(d2.getDate() - d2.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return d1 >= startOfWeek && d1 <= endOfWeek
  }

  function isSameMonth(date1, date2) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  const analytics = getAnalytics(activePeriod)

  function getPreviousKmForDate(allTrips, dateStr) {
    const list = (allTrips || [])
    // Prefer last explicit odometer reading from local storage
    const stored = getStoredReadings()
      .filter(r => r && r.date && r.km_reading != null && r.date <= dateStr)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    if (stored.length) return Number(stored[stored.length - 1].km_reading) || 0
    // Fallback to last trip's reading if no explicit reading exists
    const tripsOnly = list
      .filter(t => t.type === 'trip' && t.date <= dateStr)
      .sort((a, b) => a.date.localeCompare(b.date))
    if (tripsOnly.length) return tripsOnly[tripsOnly.length - 1].km_reading || 0
    return 0
  }

  const resetForm = () => {
    setEntryType('trip')
    setDate(new Date().toISOString().slice(0, 10))
    setKmReading('')
    setAmountReceived('')
    setFuelOdo('')
    setFuelLiters('')
    setFuelCost('')
    setFormError('')
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setFormError('')

    try {
      if (entryType === 'fuel') {
        const odo = Number(fuelOdo) || 0
        const liters = Number(fuelLiters) || 0
        const cost = Number(fuelCost) || 0
        if (liters <= 0) {
          setFormError('Please enter fuel in liters')
          setSaving(false)
          return
        }
        if (cost <= 0) {
          setFormError('Please enter fuel cost')
          setSaving(false)
          return
        }
        if (editingId) {
          const { error } = await supabase
            .from('trips')
            .update({ date, type: 'fuel', km_reading: odo, fuel_liters: liters, fuel_cost: cost })
            .eq('id', editingId)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('trips')
            .insert([{ date, type: 'fuel', km_reading: odo, fuel_liters: liters, fuel_cost: cost }])
          if (error) throw error
        }
      } else if (entryType === 'trip') {
        const previousKm = getPreviousKmForDate(
          editingId ? trips.filter(t => t.id !== editingId) : trips,
          date
        )
        const km = Number(kmReading) || 0
        const amt = Number(amountReceived) || 0
        if (km <= 0 || km < previousKm) {
          setFormError(`Odometer must be greater than previous (${previousKm}).`)
          setSaving(false)
          return
        }
        const distance = Math.max(0, km - previousKm)
        if (editingId) {
          const { error } = await supabase
            .from('trips')
            .update({ date, type: 'trip', km_reading: km, distance, amount_received: amt, fuel_cost: 0, profit: amt })
            .eq('id', editingId)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('trips')
            .insert([{ date, type: 'trip', km_reading: km, distance, amount_received: amt, fuel_cost: 0, profit: amt }])
          if (error) throw error
        }
        // Always update latest reading baseline when a trip is added/updated
        addStoredReading({ id: undefined, date, km_reading: km })
        refreshReadingList()
      } else if (entryType === 'reading') {
        const km = Number(kmReading) || 0
        if (km <= 0) {
          setFormError('Please enter a valid odometer reading')
          setSaving(false)
          return
        }
        if (readingEditingId) {
          updateStoredReading(readingEditingId, { date, km_reading: km })
          setReadingEditingId(null)
        } else {
          addStoredReading({ id: undefined, date, km_reading: km })
        }
        refreshReadingList()
      }

      await loadTrips()
      setIsAddOpen(false)
      resetForm()
    } catch (err) {
      setFormError(err?.message || 'Error saving entry')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (trip) => {
    setEditingId(trip.id)
    setEntryType(trip.type)
    setDate(trip.date)
    if (trip.type === 'trip') {
      setKmReading(String(trip.km_reading || ''))
      setAmountReceived(String(trip.amount_received || ''))
    } else if (trip.type === 'fuel') {
      setFuelOdo(String(trip.km_reading || ''))
      setFuelLiters(String(trip.fuel_liters || ''))
      setFuelCost(String(trip.fuel_cost || ''))
    }
    setIsAddOpen(true)
  }

  const startEditReading = (reading) => {
    setEntryType('reading')
    setIsAddOpen(true)
    setReadingEditingId(reading.id)
    setDate(reading.date)
    setKmReading(String(reading.km_reading || ''))
  }

  const deleteReading = (id) => {
    const ok = window.confirm('Delete this reading?')
    if (!ok) return
    deleteStoredReading(id)
  }

  const deleteTrip = async (tripId) => {
    if (!tripId) return
    const ok = window.confirm('Delete this entry?')
    if (!ok) return
    try {
      const { error } = await supabase.from('trips').delete().eq('id', tripId)
      if (error) throw error
      await loadTrips()
    } catch (err) {
      console.error('Delete error', err)
      alert('Failed to delete entry')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2">Loading trips...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="inline-grid grid-flow-col auto-cols-max gap-1 bg-gray-50 p-1 rounded-lg">
          <button
            onClick={() => setActiveView('logs')}
            className={`px-6 py-2 rounded-md text-sm font-medium ${
              activeView === 'logs'
                ? 'bg-white text-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Trip Logs
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`px-6 py-2 rounded-md text-sm font-medium ${
              activeView === 'analytics'
                ? 'bg-white text-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Analytics
          </button>
        </div>
        <Button
          size="md"
          className="inline-flex items-center"
          onClick={() => { setIsAddOpen(true) }}
        >
          Add Entry
        </Button>
      </div>

      {/* Logs View */}
      {activeView === 'logs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="inline-grid grid-flow-col auto-cols-max gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Entries
            </button>
            <button
              onClick={() => setActiveFilter('trip')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                activeFilter === 'trip'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trips
            </button>
            <button
              onClick={() => setActiveFilter('fuel')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                activeFilter === 'fuel'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Fuel
            </button>
          </div>

          {/* Trip Table (compact) */}
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Log Type</th>
                  <th className="py-2 pr-4 font-medium">KM Driven</th>
                  <th className="py-2 pr-4 font-medium">Amount Received</th>
                  <th className="py-2 pr-4 font-medium">Fuel Used (L)</th>
                  <th className="py-2 pr-4 font-medium">Fuel Cost</th>
                  <th className="py-2 pr-4 font-medium">Current Status</th>
                  <th className="py-2 pr-2 font-medium text-right w-px">Edit</th>
                  <th className="py-2 font-medium text-right w-px">Del</th>
                </tr>
              </thead>
              <tbody>
                {trips.filter(t => t.type === 'trip' || t.type === 'fuel').length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-gray-500">No logs yet</td>
                  </tr>
                ) : (
                  trips
                    .filter(t => t.type === 'trip' || t.type === 'fuel')
                    .slice(currentPage * pageSize, currentPage * pageSize + pageSize)
                    .map((row) => {
                      const distance = row.type === 'trip' ? (row.distance || 0) : 0
                      const amount = row.type === 'trip' ? (row.amount_received || 0) : 0
                      const used = row.type === 'trip' ? (distance / 16) : (row.fuel_liters || 0)
                      const cost = row.type === 'trip' ? (used * 100) : (row.fuel_cost || 0)
                      const profit = amount - cost
                      return (
                        <tr key={row.id} className="border-t align-middle">
                          <td className="py-2 pr-4 whitespace-nowrap">{formatDate(row.date)}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${row.type === 'trip' ? 'bg-green-600' : 'bg-purple-600'}`}>{row.type === 'trip' ? 'Trip' : 'Fuel'}</span>
                          </td>
                          <td className="py-2 pr-4">{distance.toLocaleString()} km</td>
                          <td className="py-2 pr-4">{formatCurrency(amount)}</td>
                          <td className="py-2 pr-4">{used.toFixed(1)} L</td>
                          <td className="py-2 pr-4">{formatCurrency(cost)}</td>
                          <td className="py-2 pr-4"><span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(profit)}</span></td>
                          <td className="py-1 pr-2 text-right w-px">
                            <button type="button" title="Edit" aria-label="Edit" onClick={() => startEdit(row)} className="h-7 w-7 rounded-md bg-blue-600 text-white text-xs font-semibold leading-none grid place-items-center">✎</button>
                          </td>
                          <td className="py-1 text-right w-px">
                            <button type="button" title="Delete" aria-label="Delete" onClick={() => deleteTrip(row.id)} className="h-7 w-7 rounded-md bg-blue-600 text-white text-xs font-semibold leading-none grid place-items-center">×</button>
                          </td>
                        </tr>
                      )
                    })
                )}
              </tbody>
            </table>
            {/* Pagination */}
            {trips.filter(t => t.type === 'trip' || t.type === 'fuel').length > pageSize && (
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  title="Previous"
                  aria-label="Previous"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className={`h-7 w-7 rounded-md text-white text-xs font-semibold leading-none grid place-items-center ${currentPage === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600'}`}
                >
                  ‹
                </button>
                <span className="text-xs text-gray-600">
                  {currentPage + 1} / {Math.max(1, Math.ceil(trips.filter(t => t.type === 'trip' || t.type === 'fuel').length / pageSize))}
                </span>
                <button
                  type="button"
                  title="Next"
                  aria-label="Next"
                  onClick={() => {
                    const total = trips.filter(t => t.type === 'trip' || t.type === 'fuel').length
                    const totalPages = Math.max(1, Math.ceil(total / pageSize))
                    setCurrentPage(p => Math.min(totalPages - 1, p + 1))
                  }}
                  className={`h-7 w-7 rounded-md text-white text-xs font-semibold leading-none grid place-items-center ${ (currentPage + 1) >= Math.ceil(trips.filter(t => t.type === 'trip' || t.type === 'fuel').length / pageSize) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600'}`}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div className="space-y-8">
          {/* Period Tabs */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setActivePeriod('today')}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                activePeriod === 'today'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:transform hover:scale-105'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActivePeriod('week')}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                activePeriod === 'week'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:transform hover:scale-105'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setActivePeriod('month')}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                activePeriod === 'month'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:transform hover:scale-105'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Analytics Cards (icons removed) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 text-center border">
              <div className="text-sm font-semibold text-gray-500 mb-1">Distance (km)</div>
              <div className="text-3xl font-bold text-gray-900">{analytics.totalDistance.toLocaleString()}</div>
            </Card>
            <Card className="p-6 text-center border">
              <div className="text-sm font-semibold text-gray-500 mb-1">Earnings</div>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.totalReceived)}</div>
            </Card>
            <Card className="p-6 text-center border">
              <div className="text-sm font-semibold text-gray-500 mb-1">Fuel Used (L)</div>
              <div className="text-3xl font-bold text-gray-900">{analytics.totalFuel.toFixed(1)}</div>
            </Card>
            <Card className="p-6 text-center border">
              <div className="text-sm font-semibold text-gray-500 mb-1">Fuel Cost</div>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.totalFuelCost)}</div>
            </Card>
          </div>
        </div>
      )}

      {/* Add Entry button moved to header */}

      {/* Add Entry Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl sm:shadow-2xl border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add {entryType === 'fuel' ? 'Fuel' : entryType === 'reading' ? 'Reading' : 'Trip'}</h3>
              <button onClick={() => { setIsAddOpen(false); resetForm(); }} className="btn-ghost text-sm">Close</button>
            </div>
            <div className="bg-gray-50 p-2 rounded-xl inline-flex mb-6">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium ${entryType === 'trip' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setEntryType('trip')}
                type="button"
              >
                Trip
              </button>
              <button
                className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium ${entryType === 'fuel' ? 'bg-white shadow text-purple-600' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setEntryType('fuel')}
                type="button"
              >
                Fuel
              </button>
              <button
                className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium ${entryType === 'reading' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setEntryType('reading')}
                type="button"
              >
                Reading
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Date</label>
                <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>

              {entryType === 'trip' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Odometer (current)</label>
                      <input type="number" min="0" className="input-field" value={kmReading} onChange={(e) => setKmReading(e.target.value)} required />
                      <p className="text-sm text-gray-500 mt-2">Prev: {getPreviousKmForDate(trips, date)} • Distance: {Math.max(0, (Number(kmReading)||0) - getPreviousKmForDate(trips, date))} km</p>
                    </div>
                    <div>
                      <label className="label">Amount Received</label>
                      <input type="number" min="0" step="0.01" className="input-field" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} />
                    </div>
                  </div>
                </>
              ) : entryType === 'fuel' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Odometer (at refuel)</label>
                      <input type="number" min="0" className="input-field" value={fuelOdo} onChange={(e) => setFuelOdo(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Fuel (L)</label>
                      <input type="number" min="0" step="0.01" className="input-field" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Fuel Cost</label>
                      <input type="number" min="0" step="0.01" className="input-field" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} required />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="label">Odometer (current)</label>
                    <input type="number" min="0" className="input-field" value={kmReading} onChange={(e) => setKmReading(e.target.value)} required />
                  </div>
                  <div className="mt-4 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4 font-medium">Date</th>
                          <th className="py-2 pr-4 font-medium">Odometer</th>
                          <th className="py-2 pr-2 font-medium text-right w-px">Edit</th>
                          <th className="py-2 font-medium text-right w-px">Del</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readingList.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-gray-500">No readings yet</td>
                          </tr>
                        ) : (
                          readingList.map(r => (
                            <tr key={r.id} className="border-t align-middle">
                              <td className="py-2 pr-4 whitespace-nowrap">{formatDate(r.date)}</td>
                              <td className="py-2 pr-4">{Number(r.km_reading||0).toLocaleString()} km</td>
                              <td className="py-1 pr-2 text-right w-px">
                                <button type="button" title="Edit" aria-label="Edit" onClick={() => startEditReading(r)} className="h-7 w-7 rounded-md bg-blue-600 text-white text-xs font-semibold leading-none grid place-items-center">✎</button>
                              </td>
                              <td className="py-1 text-right w-px">
                                <button type="button" title="Delete" aria-label="Delete" onClick={() => deleteReading(r.id)} className="h-7 w-7 rounded-md bg-blue-600 text-white text-xs font-semibold leading-none grid place-items-center">×</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => { setIsAddOpen(false); resetForm(); }}>Cancel</Button>
                <Button type="submit" loading={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </div>
      </div>
      )}
    </div>
  )
}
