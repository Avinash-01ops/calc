'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import TripLogger from './trip-logger'
 

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  useEffect(() => {
    // Initialize theme from storage or system preference
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
      const preferred = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      const next = stored || preferred
      setTheme(next)
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next)
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    // Apply theme changes
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
    try { localStorage.setItem('theme', theme) } catch (_) {}
  }, [theme])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSettings = () => {
    router.push('/settings')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Full-width Header */}
      <div className="sticky top-0 z-10 border-b border-transparent bg-[var(--primary-color)] shadow-[var(--shadow-sm)]">
        <div className="container">
          <div className="flex items-center justify-between h-12">
            <h1 className="text-lg font-bold text-[var(--primary-foreground)]">Dashboard</h1>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Settings"
                onClick={handleSettings}
                className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                title="Settings"
              >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="White" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button
                type="button"
                aria-label="Toggle dark mode"
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              >
                {theme === 'dark' ? (
                  // Sun icon (simple)
                  <svg className="h-5 w-5 text-[var(--primary-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="3.25" strokeWidth="1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M5.757 5.757l1.414 1.414M16.829 16.829l1.414 1.414M5.757 18.243l1.414-1.414M16.829 7.171l1.414-1.414" />
                  </svg>
                ) : (
                  // Moon icon (simple)
                  <svg className="h-5 w-5 text-[var(--primary-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                  </svg>
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  aria-label="User menu"
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                >
                  {/* Simple user icon */}
                  <svg className="h-5 w-5 text-[var(--primary-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="8.5" r="3" strokeWidth="1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 19c1.5-2.5 4.5-4 7-4s5.5 1.5 7 4" />
                  </svg>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-md border bg-[var(--surface-1)] shadow-lg">
                    <div className="px-3 py-2 text-xs text-[var(--text-secondary)] truncate border-b">{user?.email}</div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-[var(--primary-foreground)] bg-[var(--error-color)] hover:opacity-90 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Content */}
        <div className="py-4">
          {/* Trip Logger */}
          <TripLogger />
        </div>
      </div>
    </div>
  )  
}
