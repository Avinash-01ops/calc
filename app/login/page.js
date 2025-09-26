'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '@/components/Input'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `http://localhost:3003/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="section">
        <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Sign in
            </h1>
          </div>

          {/* Login Form */}
          <Card className="mb-8" shadow="md">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="Email address"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />

                <Input
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="md"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              {/* Google Login Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                loading={loading}
                className="w-full"
                size="md"
              >
                Continue with Google
              </Button>
            </form>
          </Card>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
