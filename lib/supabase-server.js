import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = 'https://aykuhjiruwcyxpybgweo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5a3VoamlydXdjeXhweWJnd2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjgyMjIsImV4cCI6MjA3NDIwNDIyMn0.NEG2qVqSd_-w2X_eozMLQLJbZ7_9vrSQVkWfk_U4-fg'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
