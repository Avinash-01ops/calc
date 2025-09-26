import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = createServerClient(
      'https://aykuhjiruwcyxpybgweo.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5a3VoamlydXdjeXhweWJnd2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjgyMjIsImV4cCI6MjA3NDIwNDIyMn0.NEG2qVqSd_-w2X_eozMLQLJbZ7_9vrSQVkWfk_U4-fg',
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            NextResponse.next({
              request: {
                headers: request.headers,
              },
            }).cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name, options) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            NextResponse.next({
              request: {
                headers: request.headers,
              },
            }).cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`http://localhost:3003/reset-password`)
      } else {
        return NextResponse.redirect(`http://localhost:3003/dashboard`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`http://localhost:3003/login?error=AuthCallbackError`)
}
