'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '@/components/Input'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkSession()
  }, [router, supabase])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password updated successfully! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' }
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' }
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (password.length < 12) return { strength: 3, label: 'Good', color: 'bg-blue-500' }
    return { strength: 4, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="min-h-screen bg-white">
      <div className="section">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Set new password</h1>
          </div>

          {/* Reset Form */}
          <Card className="mb-8" shadow="md">
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="New Password"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  
                  placeholder="Enter your new password"
                />
                {/* Removed strength meter for minimal UI */}

                <Input
                  label="Confirm New Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  
                  placeholder="Confirm your new password"
                  error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : null}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
                  <span className="font-medium">{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                disabled={loading || password !== confirmPassword || password.length < 6}
                className="w-full"
                size="md"
              >
                {loading ? 'Updating password...' : 'Update password'}
              </Button>
            </form>
          </Card>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
