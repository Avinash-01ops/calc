'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '@/components/Input'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
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

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `http://localhost:3003/auth/callback?type=recovery`,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Password reset link sent! Check your email for instructions.')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="section">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Reset password</h1>
          </div>

          {/* Reset Form */}
          <Card className="mb-8" shadow="md">
            <form onSubmit={handleResetPassword} className="space-y-6">
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
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
                  <span className="font-medium">{message}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                disabled={loading || !email}
                className="w-full"
                size="md"
              >
                {loading ? 'Sending reset link...' : 'Send reset link'}
              </Button>
            </form>
          </Card>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <div className="text-base text-gray-600">
              Remember your password?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Back to sign in
              </Link>
            </div>

            {/* Help block removed for minimal UI */}
          </div>
        </div>
      </div>
    </div>
  )
}
