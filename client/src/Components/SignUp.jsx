/**
 * Signup
 * Registration form with a confirm-password match indicator.
 * Validates that passwords match and are at least 8 characters before submitting.
 */
import { useState } from "react"
import { Check, X } from 'lucide-react'
import { API_URL } from '../config.js'
import AuthShell from './ui/AuthShell.jsx'
import Input from './ui/Input.jsx'
import Button from './ui/Button.jsx'

export default function Signup({ onNeedVerification, onSwitchToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (password !== confirmPassword) {
      return setError('Passwords do not match.')
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.')
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Signup failed')
      onNeedVerification(email.trim())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Track every application. Land the right job." maxWidth="440px">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div role="alert" aria-live="polite" className="flex items-center gap-2 text-error-700 dark:text-error-400 px-3.5 py-2.5 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-control text-sm">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          helperText="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          success={confirmPassword.length > 0 && passwordsMatch}
          error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined}
          endAdornment={confirmPassword.length > 0 && (
            passwordsMatch
              ? <Check size={16} className="text-success-500" />
              : <X size={16} className="text-error-500" />
          )}
        />

        <Button type="submit" variant="primary" loading={loading} className="w-full mt-1">
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-1 m-0">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="bg-transparent border-none text-primary-600 font-medium cursor-pointer p-0 hover:text-primary-700 hover:underline transition-colors duration-150 text-sm rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Log in
          </button>
        </p>
      </form>
    </AuthShell>
  )
}
