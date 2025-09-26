'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '@/components/Input'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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

  const handleSignup = async (e) => {
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

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `http://localhost:3003/auth/callback`,
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Account created successfully! Please check your email to verify your account.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
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
            <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
          </div>

          {/* Signup Form */}
          <Card className="mb-8" shadow="md">
            <form onSubmit={handleSignup} className="space-y-6">
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
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                />

                {/* Password Strength Indicator */}
                {/* Removed strength meter for minimal UI */}

                <Input
                  label="Confirm password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
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
                disabled={loading || password !== confirmPassword}
                className="w-full"
                size="md"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </Card>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <div className="text-base text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Sign in instead
              </Link>
            </div>

            {/* Nonessential legal links removed for minimal UI */}
          </div>
        </div>
      </div>
    </div>
  )
}
