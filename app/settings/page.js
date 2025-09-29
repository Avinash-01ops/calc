'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Button from '@/components/Button'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const [cars, setCars] = useState([])
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    car_no: '',
    car_name: '',
    manufacturing_year: '',
    fuel_type: '',
    engine_cc: '',
  })

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      setLoading(false)
      await fetchCars(session.user)
    }
    init()
  }, [router, supabase])

  const fetchCars = async (u = user) => {
    if (!u) return
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', u.id)
      .order('created_at', { ascending: false })
    if (!error) setCars(data || [])
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      car_no: form.car_no.trim(),
      car_name: form.car_name.trim(),
      manufacturing_year: form.manufacturing_year ? parseInt(form.manufacturing_year, 10) : null,
      fuel_type: form.fuel_type.trim(),
      engine_cc: form.engine_cc ? parseInt(form.engine_cc, 10) : null,
    }
    let error
    if (editingId) {
      ;({ error } = await supabase
        .from('cars')
        .update({
          car_no: payload.car_no,
          car_name: payload.car_name,
          manufacturing_year: payload.manufacturing_year,
          fuel_type: payload.fuel_type,
          engine_cc: payload.engine_cc,
        })
        .eq('id', editingId)
        .eq('user_id', user.id))
    } else {
      ;({ error } = await supabase.from('cars').insert(payload))
    }
    setSaving(false)
    if (!error) {
      setForm({ car_no: '', car_name: '', manufacturing_year: '', fuel_type: '', engine_cc: '' })
      setEditingId(null)
      fetchCars()
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('cars').delete().eq('id', id).eq('user_id', user.id)
    fetchCars()
  }

  const startEdit = (car) => {
    setEditingId(car.id)
    setForm({
      car_no: car.car_no || '',
      car_name: car.car_name || '',
      manufacturing_year: car.manufacturing_year?.toString() || '',
      fuel_type: car.fuel_type || '',
      engine_cc: car.engine_cc?.toString() || '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ car_no: '', car_name: '', manufacturing_year: '', fuel_type: '', engine_cc: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="px-4">
      <div className="sticky top-0 z-10 border-b border-transparent bg-[var(--primary-color)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
           
              <h1 className="text-lg font-bold text-[var(--primary-foreground)]">Settings</h1>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                aria-label="Back to dashboard"
                title="Back"
              >
                <svg className="h-5 w-5 text-[var(--primary-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h20" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <Card className="bg-[var(--surface-1)]" padding="md">
            <h2 className="text-base font-bold text-gray-900 mb-4">Car Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Car No"
                name="car_no"
                value={form.car_no}
                onChange={handleChange}
                placeholder="e.g., MH12AB1234"
              />
              <Input
                label="Car Name"
                name="car_name"
                value={form.car_name}
                onChange={handleChange}
                placeholder="e.g., Swift VXI"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Year"
                  name="manufacturing_year"
                  value={form.manufacturing_year}
                  onChange={handleChange}
                  placeholder="e.g., 2018"
                  inputMode="numeric"
                />
                <Input
                  label="Fuel Type"
                  name="fuel_type"
                  value={form.fuel_type}
                  onChange={handleChange}
                  placeholder="e.g., Petrol/Diesel/CNG/EV"
                />
                <Input
                  label="Engine CC"
                  name="engine_cc"
                  value={form.engine_cc}
                  onChange={handleChange}
                  placeholder="e.g., 1197"
                  inputMode="numeric"
                />
              </div>
              <div className="flex justify-end gap-2">
                {editingId && (
                  <Button variant="ghost" type="button" onClick={cancelEdit} disabled={saving} className="px-3 py-2">
                    Cancel
                  </Button>
                )}
                <Button variant="success" type="submit" loading={saving} disabled={saving || !form.car_no || !form.car_name}>
                  {editingId ? 'Update Car' : 'Save Car'}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="bg-[var(--surface-1)]" padding="md">
            <h2 className="text-base font-bold text-gray-900 mb-4">Your Cars</h2>
            <div className="divide-y">
              {cars.length === 0 && (
                <div className="text-sm text-gray-500">No cars added yet.</div>
              )}
              {cars.map((car) => (
                <div key={car.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{car.car_name} <span className="text-gray-500">({car.car_no})</span></div>
                    <div className="text-xs text-gray-500">{car.manufacturing_year || '—'} • {car.fuel_type || '—'} • {car.engine_cc ? `${car.engine_cc} cc` : '—'}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" className="text-[var(--text-secondary)] hover:bg-[var(--surface-2)] px-3 py-2" onClick={() => startEdit(car)}>
                      Edit
                    </Button>
                    <Button variant="danger" className="px-3 py-2" onClick={() => handleDelete(car.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


